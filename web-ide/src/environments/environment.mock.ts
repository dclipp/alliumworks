export const environment = {
  production: false,
  useMock: true,
  statusHost: {
    domain: 'localhost:51019',
    route: '',
    scheme: 'http'
  },
  allowedQueries: [
    {
      name: 'bootstrap',
      richText: false
    }
  ]
};
