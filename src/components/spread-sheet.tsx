"use client";

import { useEffect, useRef, useState } from "react";

import { dictionaries, formatPrice, type Category, type Dictionary } from "@/lib/i18n";
import type { SpreadDish } from "@/lib/menu";
import {
  MAX_QUANTITY,
  add,
  clear,
  fill,
  remove,
  setKnownDishes,
  useOpenRequests,
  useQuantity,
  useSpread,
} from "@/lib/spread";

/** How long the "are you sure" stays up before it lapses as a mis-tap. */
const CONFIRM_MS = 8000;

/**
 * على السفرة — the list itself.
 *
 * A `<dialog>` opened with `showModal`, which is the same precedent
 * `venue-sheet.tsx` set: focus trap, Esc, backdrop click, focus back to the
 * opener when it closes, all from the platform. It differs from that sheet in
 * being ivory paper with navy ink rather than navy on navy — the venue sheet is
 * chrome, this is the guest's own content and should read like the menu.
 *
 * `dishes` is every dish in this language, in printed order, rendered on the
 * server and handed in. The sheet filters it rather than sorting anything, so
 * the list is grouped Food → Sweets → Drinks and, inside a group, in the order
 * the guest scrolled past — never in the order things were added. A list that
 * reshuffles when a coffee goes on has to be re-read from the top.
 */
export function SpreadSheet({
  dishes,
  dictionary,
  currency,
}: {
  dishes: SpreadDish[];
  dictionary: Dictionary;
  currency: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const requests = useOpenRequests();
  const spread = useSpread();
  const [confirming, setConfirming] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const copy = dictionary.spread;

  /* This build's dish keys. Anything in storage that is not one of them is from
     an older build and cannot be drawn, so the store drops it rather than
     counting a row the guest can neither see nor clear. */
  useEffect(() => {
    setKnownDishes(dishes.map((dish) => dish.key));
  }, [dishes]);

  useEffect(() => {
    if (requests === 0) return;
    const dialog = dialogRef.current;
    if (typeof dialog?.showModal !== "function" || dialog.open) return;
    dialog.showModal();
  }, [requests]);

  /*
   * Anything that removes the element a guest is standing on — a row reaching
   * zero, the clear question replacing the button that raised it — drops focus
   * onto <body>, and a keyboard guest is then Tabbing blind inside a modal.
   * The sharp case is clearing: the question lapses after eight seconds, so
   * they are hunting for a control on a timer. After every change that can
   * remove a control, focus is put somewhere deliberate inside the dialog.
   */
  const restoreFocus = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    const active = document.activeElement;
    if (active && active !== document.body && dialog.contains(active)) return;
    dialog.querySelector<HTMLElement>("button, [href], input, select, textarea")?.focus();
  };

  // The question lapses rather than sitting there waiting to be answered.
  useEffect(() => {
    if (!confirming) return;
    // The button that raised the question has just been replaced, so send the
    // guest straight to the answer rather than leaving them to find it.
    confirmRef.current?.focus();
    const timer = window.setTimeout(() => {
      setConfirming(false);
      requestAnimationFrame(() => restoreFocus());
    }, CONFIRM_MS);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  const picked = dishes.filter((dish) => (spread[dish.key] ?? 0) > 0);

  /* After the commit, not inside the handler: the row that had focus is
     unmounted by the render, so anything scheduled before it still sees the old
     tree. */
  useEffect(() => {
    restoreFocus();
  }, [picked.length, confirming]);
  const total = picked.reduce(
    (sum, dish) => sum + dish.price * (spread[dish.key] ?? 0),
    0,
  );

  const groups = (["food", "sweets", "drinks"] as Category[])
    .map((category) => ({
      category,
      label: dictionary.categoryLabels[category],
      dishes: picked.filter((dish) => dish.category === category),
    }))
    .filter((group) => group.dishes.length > 0);

  return (
    <dialog
      ref={dialogRef}
      aria-label={copy.name}
      className="spread-sheet"
      onClose={() => setConfirming(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="spread-sheet-head">
        <div>
          <h2 className="spread-sheet-title">{copy.name}</h2>
          <p className="text-ink/72 mt-1.5 text-[13.5px] leading-[1.5]">
            {picked.length > 0 ? copy.instruction : copy.emptyLead}
          </p>
        </div>
        <form method="dialog">
          <button
            type="submit"
            className="eyebrow text-ink/72 hover:text-ink -me-2 px-2 py-2 transition-colors"
          >
            {dictionary.close}
          </button>
        </form>
      </div>

      {/* The card-level live regions are behind the modal and inert, so the
          sheet needs its own: a change made in here is otherwise silent. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>

      <div className="spread-sheet-body">
        {picked.length === 0 ? (
          <p className="font-display rtl:font-naskh text-ink/80 max-w-[34ch] text-[20px] leading-[1.5]">
            {copy.emptyBody}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.category} className="spread-group">
              <h3 className="spread-group-heading">
                <span>{group.label}</span>
                <span aria-hidden="true" className="spread-group-rule" />
              </h3>
              <ul>
                {group.dishes.map((dish) => (
                  <SpreadRow
                    key={dish.key}
                    dish={dish}
                    dictionary={dictionary}
                    currency={currency}
                    onChange={setAnnouncement}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <div className="spread-sheet-foot">
        {picked.length > 0 ? (
          <div className="spread-total">
            <p className="eyebrow text-ink/72">{copy.total}</p>
            <div className="spread-total-figure">
              <p className="flex items-baseline justify-end gap-[5px] leading-[normal]">
                <span className="price-amount text-[26px]">{formatPrice(total)}</span>
                <span className="price-currency text-ink/72">{currency}</span>
              </p>
              {/* One caption line attached to the number, not three stacked
                  rows: a column of aligned amounts is a receipt, and this is
                  not one. What it says is "nothing is added to this". */}
              <p className="spread-charges text-ink/72">{copy.charges}</p>
            </div>
            <p className="text-ink/72 spread-total-note">{copy.totalNote}</p>
          </div>
        ) : null}

        <div className="spread-actions">
          {picked.length === 0 ? (
            <span />
          ) : confirming ? (
            /* Asked once, in place. A second dialog on top of a dialog to
               confirm emptying a list nobody has paid for is too much. */
            <span className="spread-confirm">
              <span className="text-ink/80">{copy.clearConfirm}</span>
              <button
                type="button"
                className="spread-link"
                ref={confirmRef}
                onClick={() => {
                  clear();
                  setConfirming(false);
                  setAnnouncement(copy.emptyLead);
                  requestAnimationFrame(() => restoreFocus());
                }}
              >
                {copy.clearYes}
              </button>
              <span aria-hidden="true" className="text-ink/35">
                ·
              </span>
              <button
                type="button"
                className="spread-link"
                onClick={() => setConfirming(false)}
              >
                {copy.clearNo}
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="spread-link"
              onClick={() => setConfirming(true)}
            >
              {copy.clear}
            </button>
          )}

          <form method="dialog">
            <button type="submit" className="spread-link">
              {copy.back}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

/**
 * One row: the stepper first, so the quantity is read before the dish.
 *
 * Outlined here rather than filled — in the sheet every row is already on the
 * table, so a filled pill would say nothing, and eight filled pills in a column
 * would be louder than the dish names.
 *
 * The name is 20px display / 18px naskh, one step below the card's 22/19. The
 * row has no photograph and no description, so the name is the only thing
 * identifying the dish, read in a dim room on a phone held in one hand.
 */
function SpreadRow({
  dish,
  dictionary,
  currency,
  onChange,
}: {
  dish: SpreadDish;
  dictionary: Dictionary;
  currency: string;
  /** Told what happened, so the sheet can announce it and keep focus inside. */
  onChange: (announcement: string) => void;
}) {
  const quantity = useQuantity(dish.key);
  const copy = dictionary.spread;
  if (quantity <= 0) return null;
  const full = quantity >= MAX_QUANTITY;
  const say = (next: number) =>
    onChange(
      next > 0
        ? fill(copy.announce, { dish: dish.name, n: next })
        : fill(copy.announceGone, { dish: dish.name }),
    );

  return (
    <li className="spread-row">
      <div className="spread-control spread-control-outline" data-on="true">
        <button
          type="button"
          className="spread-cap spread-minus"
          aria-label={fill(quantity === 1 ? copy.remove : copy.fewer, {
            dish: dish.name,
          })}
          onClick={() => {
            remove(dish.key);
            say(quantity - 1);
          }}
        >
          <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
            <path
              d="M2.2 7h9.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="spread-quantity">{quantity}</span>
        <button
          type="button"
          className="spread-cap spread-plus"
          aria-label={fill(copy.more, { dish: dish.name })}
          disabled={full}
          aria-disabled={full || undefined}
          onClick={() => {
            add(dish.key);
            say(quantity + 1);
          }}
        >
          <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
            <path
              d="M7 2.2v9.6M2.2 7h9.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="min-w-0">
        {/* The name alone is not enough for the dishes the menu prints twice. */}
        {dish.duplicated ? (
          <p className="eyebrow text-ink/72 mb-1">{dish.section}</p>
        ) : null}

        {/* A dish this menu does not print keeps the language it is written in,
            so the browser sets and reads it correctly. */}
        <p
          className="spread-row-name"
          lang={dish.foreign ? dictionaries[dish.foreign].locale : undefined}
          dir={dish.foreign ? dictionaries[dish.foreign].dir : undefined}
        >
          {dish.name}
        </p>

        {/* Both printings in the same section: the section says nothing, so
            the printed description goes in, word for word. */}
        {dish.sameSection && dish.description ? (
          <p className="text-ink/72 mt-1 text-[12.5px] leading-[1.45]">
            {dish.description}
          </p>
        ) : null}
        <p className="mt-1 flex items-baseline gap-[5px] leading-[normal]">
          <span className="price-amount text-[15px]">
            {formatPrice(dish.price * quantity)}
          </span>
          <span className="price-currency text-ink/72">{currency}</span>
        </p>
      </div>
    </li>
  );
}
