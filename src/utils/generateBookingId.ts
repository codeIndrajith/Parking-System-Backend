export const generateSequentialBookingId = (lastBookingId?: string): string => {
  const prefix = "BOOK-";
  let nextNumber = 1;

  if (lastBookingId) {
    const lastNumber = parseInt(lastBookingId.replace(prefix, ""), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};
