import type { DetailedHTMLProps, HTMLAttributes } from "react";

type RdfAdapterProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  url?: string;
  format?: string;
  strategy?: string;
  cache?: string;
  subject?: string;
  "subject-query"?: string;
  "subject-class"?: string;
  depth?: number;
};

type RdfLensProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  "shape-file"?: string;
  "shape-class"?: string;
  multiple?: boolean;
  subject?: string;
};

type LensDisplayProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  template?: string;
  mode?: string;
};

type LinkOrchestrationProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  "config-src"?: string;
  "debounce-ms"?: number;
  "max-concurrent-pipelines"?: number;
  "allow-recursive"?: boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "rdf-adapter": RdfAdapterProps;
      "rdf-lens": RdfLensProps;
      "lens-display": LensDisplayProps;
      "link-orchestration": LinkOrchestrationProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "rdf-adapter": RdfAdapterProps;
      "rdf-lens": RdfLensProps;
      "lens-display": LensDisplayProps;
      "link-orchestration": LinkOrchestrationProps;
    }
  }
}

export {};
