import { test } from './fixtures/base';


test('Home carga con elementos básicos', async ({ home }) => {
  await home.goto();
  await home.assertBasicUI();
});
