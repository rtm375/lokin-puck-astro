export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-red-500">
      {message || "Something went wrong"}
    </div>
  );
}