
export const generateId = (): string => {
  return `id_${Math.random().toString(36).substring(2, 11)}`;
};
