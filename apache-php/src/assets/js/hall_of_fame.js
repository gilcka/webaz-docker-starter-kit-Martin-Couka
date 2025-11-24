Vue.createApp({
    data() {
        return {
        joueurs: [],
        chargement: true
        }
    },
    mounted() {
        this.chargementScores();
    },
    methods: {
        chargementScores() {
            fetch('/api/joueurs') 
            .then(response => response.json())
            .then(data => {
                this.joueurs = data;
            })
            .catch(error => {
                console.error('Erreur chargement scores:', error);
            })
            .finally(() => {
                this.chargement = false;
            });
        },
        commencerJeu() {
            window.location.href = '/escape';
        }
    }
}).mount('#app');