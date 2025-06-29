import app from './app';
import { PORT } from './config/env';
import logger from './config/logger';

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
