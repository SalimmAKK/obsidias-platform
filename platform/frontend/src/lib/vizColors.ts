/* ============================================================================
   Chart colours, as literal hex
   ============================================================================
   These MIRROR the --viz-* and --st-* custom properties in styles/tokens.css.
   Keep the two in sync; tokens.css is the documentation of record and carries
   the validator results for each group.

   Why duplicate them here at all: Recharts passes `fill` and `stroke` through
   to SVG presentation attributes. Chromium does resolve var() there (verified
   directly), but support is not dependable across Firefox and Safari, and the
   failure mode is silent — a bar renders black or not at all, which on a
   chart means the reader is given wrong information rather than an obvious
   error. DOM inline styles resolve var() everywhere, so plain markup keeps
   using the custom properties; only chart primitives read from here.
   ========================================================================= */

/* ORDINAL — pipeline progression. One hue, monotone lightness, light→dark, so
   the order is legible to a colourblind reader (lightness always survives).
   Validated --ordinal against the paper surface. */
export const STAGE = {
  s1: '#eb9078',
  s2: '#e0705a',
  s3: '#d0533c',
  s4: '#b03e29',
  s5: '#8a2d1d',
} as const;

/* Exits from the pipeline. Neutral on purpose: archived and dead are not
   later stages and must not read as further along the ramp. */
export const EXIT = '#8a8478';
export const EXIT_DEEP = '#55503f';

/* CATEGORICAL — two series (captured vs qualified). Validated: lightness
   band, chroma floor, CVD ΔE 16.7 protan, normal-vision ΔE 27.5, ≥3:1 on
   surface — all pass. */
export const SERIES_1 = '#d0533c';
export const SERIES_2 = '#2a6fa8';

/* Recessive chrome. */
export const CURSOR_WASH = 'rgba(208, 83, 60, 0.06)';

/* Lead status → ramp position. Stage order is the pipeline order; archived
   and dead fall out to the neutrals. */
export const STATUS_COLORS: Record<string, string> = {
  new: STAGE.s1,
  needs_review: STAGE.s2,
  nurturing: STAGE.s3,
  qualified: STAGE.s4,
  booked: STAGE.s5,
  archived: EXIT,
  dead: EXIT_DEEP,
};

/* Buckets are ordinal too — hot > warm > cold reads as intensity. */
export const BUCKET_COLORS: Record<string, string> = {
  hot: STAGE.s5,
  warm: STAGE.s3,
  cold: EXIT,
};
