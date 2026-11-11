/**
 * Facts the privacy policy (/gizlilik) and the account deletion page (/hesap-silme) are built on.
 * Contact details (address, phone, e-mail) come from the site settings in the panel; these are the rest.
 * Change them here when they change, and update `updatedOn`.
 */
export const LEGAL = {
  /** Data controller (veri sorumlusu): the business's legal name as on its tax registration. */
  controller: "Pelin Öztepe (Okulum Yeryüzü)",
  /** Publishes the app in the App Store and Google Play (the stores show this name as developer / seller). */
  publisher: "Ali Öztepe",
  /** Shown as "Son güncelleme". */
  updatedOn: "12 Kasım 2026",
  /** Days within which a deletion / KVKK request is answered (KVKK m.13: at most 30). */
  answerDays: 30,
};
