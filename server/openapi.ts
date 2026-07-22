import { apiEndpoints } from '../src/data/mock.js'

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'NSC Summer 2026 Web API',
    version: '0.1.0',
    description: 'Node.js BFF for Vue.js frontend and Paper plugin REST/WebSocket integration.',
  },
  servers: [{ url: '/api' }],
  paths: Object.fromEntries(
    apiEndpoints.map((endpoint) => [
      endpoint.path.replace('/api', ''),
      {
        [endpoint.method.toLowerCase()]: {
          summary: endpoint.description,
          security: endpoint.auth ? [{ bearerAuth: [] }] : [],
          responses: {
            200: {
              description: 'Successful response',
            },
          },
        },
      },
    ]),
  ),
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
}
