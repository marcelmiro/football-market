export function UserBalance({ cash }: { cash: number }) {
  return (
    <div className="flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
      €{cash.toFixed(2)}
    </div>
  );
}
