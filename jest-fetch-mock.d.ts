declare module 'jest-fetch-mock' {
  const fetchMock: {
    mock: any;
    reset(): unknown;
    mockResponse: (body: any, init?: ResponseInit) => void;
    mockReject: (error?: any) => void;
    resetMocks: () => void;
    resetHistory: () => void;
    // Adicione outras declarações de tipo conforme necessário
  };
  
  export default fetchMock;
}
