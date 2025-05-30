import express from 'express';
import router from './routes/index.js';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
});

export default app;