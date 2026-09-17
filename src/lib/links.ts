/**
 * Where the footer links go.
 *
 * The client supplied one URL — the Em Sherif website. "Contact Us", "Who We
 * Are" and "Blogs" are named in the brief but their pages were never given, so
 * rather than invent paths that might 404 they point at the site root until the
 * real ones arrive. Changing them is a one-line job, here.
 *
 * See docs/pending-content.md.
 */
export const emSherifWebsite = "https://emsherif.com";

export const footerHrefs = {
  /** TODO: the café's own contact page, once supplied. */
  contact: emSherifWebsite,
  /** TODO: the "who we are" page, once supplied. */
  about: emSherifWebsite,
  website: emSherifWebsite,
  /** TODO: the Em Sherif blog page, once supplied. */
  blog: emSherifWebsite,
} as const;
