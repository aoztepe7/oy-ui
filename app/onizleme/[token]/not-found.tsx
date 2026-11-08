/** Unknown or expired preview token (sessions live 2 hours after the last change). */
export default function PreviewNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl text-forest">Önizleme bulunamadı</h1>
        <p className="mt-3 text-bark">Önizleme oturumunun süresi dolmuş olabilir. Düzenleyicide bir değişiklik yapınca yenilenir.</p>
      </div>
    </main>
  );
}
