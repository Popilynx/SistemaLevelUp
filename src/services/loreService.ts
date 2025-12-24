import { LoreChapter } from '@/types';

class LoreService {
    private CHAPTERS: LoreChapter[] = [
        {
            id: 'chapter_1',
            level_required: 1,
            title: 'O Despertar do Caçador',
            content: 'Você acorda em um mundo onde a procrastinação tomou forma física. Uma voz ecoa: "A disciplina é sua única arma". Este é o começo da sua jornada para o Level Up.',
            unlocked: true
        },
        {
            id: 'chapter_2',
            level_required: 5,
            title: 'A Primeira Vitória',
            content: 'Após superar os primeiros desafios, você sente uma centelha de poder. Os monstros da inércia recuam diante do seu foco. Mas o caminho à frente ainda é sombrio.',
            unlocked: false
        },
        {
            id: 'chapter_3',
            level_required: 10,
            title: 'O Enigmático Mestre',
            content: 'Um vulto encapuzado observa seus treinos. "Não basta agir", ele diz, "é preciso constância". Você descobre que a verdadeira força vem da repetição silenciosa.',
            unlocked: false
        },
        {
            id: 'chapter_4',
            level_required: 20,
            title: 'A Arena dos Bosses',
            content: 'Vozes falam de criaturas colossais que guardam os portões da maestria. Você agora está pronto para enfrentar os Bosses que antes pareciam impossíveis.',
            unlocked: false
        }
    ];

    public getChapters(playerLevel: number): LoreChapter[] {
        return this.CHAPTERS.map(ch => ({
            ...ch,
            unlocked: playerLevel >= ch.level_required
        }));
    }

    public getLatestUnlocked(playerLevel: number): LoreChapter | undefined {
        return [...this.CHAPTERS].reverse().find(ch => playerLevel >= ch.level_required);
    }
}

export const loreService = new LoreService();
