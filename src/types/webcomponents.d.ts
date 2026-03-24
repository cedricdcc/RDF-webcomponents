import type { DetailedHTMLProps, HTMLAttributes } from "react";

type SourceRdfProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  url?: string;
  config?: string;
};

type RdfLensProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  config?: string;
};

type LensDisplayProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  template?: string;
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
      "source-rdf": SourceRdfProps;
      "rdf-lens": RdfLensProps;
      "lens-display": LensDisplayProps;
      "link-orchestration": LinkOrchestrationProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "source-rdf": SourceRdfProps;
      "rdf-lens": RdfLensProps;
      "lens-display": LensDisplayProps;
      "link-orchestration": LinkOrchestrationProps;
    }
  }
}

export {};
