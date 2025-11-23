// vue pour le hall of fame dans le menu
Vue.createApp({
    data() {
        return {
        scores: [],
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
                this.scores = data;
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