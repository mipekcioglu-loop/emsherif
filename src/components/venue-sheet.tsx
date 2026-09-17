"use client";

import { useRef, type ReactNode } from "react";

/**
 * The ⓘ in the hero, and the sheet it opens.
 *
 * Address and hours are four lines a guest wants on the way in, not after 128
 * dishes, so the affordance sits in the hero and the content comes to them.
 * The trigger is a real link to the same content in the footer: with no
 * JavaScript it jumps there, with JavaScript it opens the sheet instead.
 *
 * `children` is the venue block, rendered on the server and handed in.
 */
export function VenueSheet({
  label,
  closeLabel,
  targetId,
  children,
}: {
  label: string;
  closeLabel: string;
  targetId: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <a
        href={`#${targetId}`}
        onClick={(event) => {
          /* Only take the click if there really is a dialog to open; anything
             else follows the link to the same content in the footer. */
          const dialog = dialogRef.current;
          if (typeof dialog?.showModal !== "function") return;
          event.preventDefault();
          dialog.showModal();
        }}
        className="eyebrow text-ink/72 hover:text-ink border-ink/15 hover:border-ink/28 mt-3.5 inline-flex w-fit items-center gap-[7px] border-b pb-[5px] transition-colors"
      >
        <span aria-hidden="true" className="text-[12.5px] tracking-normal opacity-75">
          &#9432;
        </span>
        {label}
      </a>

      <dialog
        ref={dialogRef}
        className="bg-ink text-paper backdrop:bg-ink/50 m-0 mt-auto max-h-[90dvh] w-full max-w-none px-5 pt-3 pb-6 sm:mx-auto sm:my-auto sm:max-w-2xl sm:rounded-md sm:px-8 sm:pb-8"
        onClick={(event) => {
          /* Click on the backdrop — the dialog element itself — closes it. */
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form method="dialog" className="flex justify-end">
          <button
            type="submit"
            className="eyebrow text-paper/60 hover:text-paper -me-2 px-2 py-2 transition-colors"
          >
            {closeLabel}
          </button>
        </form>
        {children}
      </dialog>
    </>
  );
}
