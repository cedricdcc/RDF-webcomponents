/**
 * @fileoverview Worker message protocol and communication utilities
 * @module rdf-webcomponents/core/protocol
 * 
 * This module provides utilities for creating, sending, and receiving messages
 * between the main thread and Web Workers. It handles message correlation,
 * timeouts, and error handling.
 */

import type { WorkerMessage } from '../../types';
import { MessageType } from '../../types';

// ============================================================================
// Message Creation
// ============================================================================

/**
 * Generates a unique message ID
 */
export function generateMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a worker message with proper structure
 */
export function createMessage<T>(type: MessageType | string, payload: T): WorkerMessage<T> {
  return {
    id: generateMessageId(),
    type,
    payload,
    timestamp: Date.now(),
  };
}

// ============================================================================
// Message Sending
// ============================================================================

/**
 * Response handler for pending requests
 */
interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
}

/**
 * Manages communication with a Web Worker
 */
export class WorkerMessenger {
  private worker: Worker;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTimeout: number;
  private messageHandlers: Map<string, (payload: unknown) => void> = new Map();

  constructor(worker: Worker, defaultTimeout = 60000) {
    this.worker = worker;
    this.defaultTimeout = defaultTimeout;
    this.setupMessageHandler();
  }

  /**
   * Sets up the message event handler
   */
  private setupMessageHandler(): void {
    this.worker.addEventListener('message', (event) => {
      const message = event.data as WorkerMessage;
      
      // Check if this is a response to a pending request
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(message.id);
        
        if (message.type.endsWith('_ERROR') || message.type.endsWith('_RESPONSE')) {
          if (message.type.endsWith('_ERROR')) {
            pending.reject(message.payload);
          } else {
            pending.resolve(message.payload);
          }
        }
        return;
      }
      
      // Check for registered handlers
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message.payload);
      }
    });
  }

  /**
   * Sends a message and waits for a response
   */
  async send<T = unknown, R = unknown>(
    type: MessageType | string,
    payload: T,
    timeout = this.defaultTimeout
  ): Promise<R> {
    const message = createMessage(type, payload);
    
    return new Promise<R>((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);
      
      // Store pending request
      this.pendingRequests.set(message.id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout: timeoutId,
      });
      
      // Send message
      this.worker.postMessage(message);
    });
  }

  /**
   * Sends a message without waiting for a response (fire and forget)
   */
  notify<T>(type: MessageType | string, payload: T): void {
    const message = createMessage(type, payload);
    this.worker.postMessage(message);
  }

  /**
   * Registers a handler for a specific message type
   */
  on(type: string, handler: (payload: unknown) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Removes a handler for a specific message type
   */
  off(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Terminates the worker
   */
  terminate(): void {
    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();
    this.messageHandlers.clear();
    this.worker.terminate();
  }

  /**
   * Gets the underlying worker instance
   */
  getWorker(): Worker {
    return this.worker;
  }
}

// ============================================================================
// Worker-Side Message Handling
// ============================================================================

/**
 * Handler function type for worker messages
 */
type MessageHandler<T = unknown, R = unknown> = (
  payload: T,
  message: WorkerMessage<T>
) => Promise<R> | R;

/**
 * Manages message handling on the worker side
 */
export class WorkerMessageHandler {
  private handlers: Map<string, MessageHandler> = new Map();

  /**
   * Registers a handler for a message type
   */
  handle<T = unknown, R = unknown>(
    type: MessageType | string,
    handler: MessageHandler<T, R>
  ): void {
    this.handlers.set(type, handler as MessageHandler);
  }

  /**
   * Starts listening for messages
   */
  start(): void {
    self.addEventListener('message', async (event) => {
      const message = event.data as WorkerMessage;
      const handler = this.handlers.get(message.type);
      
      if (!handler) {
        console.warn(`No handler for message type: ${message.type}`);
        return;
      }
      
      try {
        const result = await handler(message.payload, message);
        const responseMessage = createMessage(
          (message.type + '_RESPONSE') as MessageType,
          result
        );
        responseMessage.id = message.id; // Keep same ID for correlation
        self.postMessage(responseMessage);
      } catch (error) {
        const errorMessage = createMessage(
          (message.type + '_ERROR') as MessageType,
          {
            error: error instanceof Error ? error.message : String(error),
            originalMessage: message,
          }
        );
        errorMessage.id = message.id;
        self.postMessage(errorMessage);
      }
    });
    
    // Signal that worker is ready
    self.postMessage(createMessage(MessageType.WORKER_READY, { timestamp: Date.now() }));
  }
}

// ============================================================================
// Progress Reporting
// ============================================================================

/**
 * Reports progress from within a worker
 */
export function reportProgress(
  messageId: string,
  phase: string,
  progress: number,
  message: string
): void {
  self.postMessage(
    createMessage(MessageType.FETCH_PROGRESS, {
      messageId,
      phase,
      progress,
      message,
    })
  );
}

// ============================================================================
// Worker Factory
// ============================================================================

/**
 * Creates a worker from a module URL
 */
export function createWorkerFromModule(moduleUrl: URL | string): Worker {
  // Create a blob URL that imports and starts the worker module
  const workerCode = `
    import('${moduleUrl.toString()}');
  `;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  const worker = new Worker(blobUrl, { type: 'module' });
  
  // Clean up blob URL after worker loads
  worker.addEventListener('message', function handler(event) {
    if (event.data.type === 'WORKER_READY') {
      URL.revokeObjectURL(blobUrl);
      worker.removeEventListener('message', handler);
    }
  });
  
  return worker;
}

/**
 * Creates a worker from inline code
 */
export function createWorkerFromCode(code: string): Worker {
  const blob = new Blob([code], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  const worker = new Worker(blobUrl, { type: 'module' });
  
  worker.addEventListener('message', function handler(event) {
    if (event.data.type === 'WORKER_READY') {
      URL.revokeObjectURL(blobUrl);
      worker.removeEventListener('message', handler);
    }
  });
  
  return worker;
}

// ============================================================================
// Transferable Utilities
// ============================================================================

/**
 * Creates a transferable array buffer from a string
 */
export function stringToTransferable(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Converts an array buffer back to a string
 */
export function transferableToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

/**
 * Creates a structured clone transferable for postMessage
 */
export function createTransferable<T>(data: T): { data: T; transferables: Transferable[] } {
  // For most data, structured clone works automatically
  // This is a placeholder for explicit transferable optimization
  return { data, transferables: [] };
}
