export function isDatabaseUnavailable(error) {
  const message = error?.message || '';
  const name = error?.name || '';

  return (
    name.startsWith('Sequelize') ||
    /ECONNREFUSED|ETIMEDOUT|Access denied|Unknown database|Table .* doesn't exist/i.test(message)
  );
}
