// Mock locale di Base44 per far funzionare l'app senza server esterni

export const base44 = {
  auth: {
    // Restituisce l'utente attualmente salvato nel browser (o null se non loggato)
    async me() {
      const user = localStorage.getItem('muscle_mock_user');
      return user ? JSON.parse(user) : null;
    },
    
    // Simula un login salvando i dati localmente
    async login(credentials) {
      const mockUser = { 
        id: '1', 
        email: credentials.email || 'test@user.com', 
        name: 'Utente Locale' 
      };
      localStorage.setItem('muscle_mock_user', JSON.stringify(mockUser));
      return { user: mockUser };
    },

    // Simula il logout pulendo il localStorage
    async logout() {
      localStorage.removeItem('muscle_mock_user');
      window.location.reload();
    }
  },

  // Gestione generica fittizia per tabelle/dati (se l'app li usa)
  entities: {
    // Aggiungi qui eventuali metodi se l'app fa chiamate a tabelle specifiche
  }
};
