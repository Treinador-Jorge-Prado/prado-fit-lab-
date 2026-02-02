
// Removed non-existent 'Workout' import.
import { User, UserRole, Exercise, EvolutionEntry } from './types';

export const INITIAL_EXERCISES: Exercise[] = [
  // PEITO (1-15)
  { id: 'peito-01', nome: 'Supino Reto com Barra', grupo_muscular: 'Peito', equipamento: 'Barra', instrucoes: 'Desça a barra até o peito e empurre com força explosiva.', video_url: '', categoria: 'Básico' },
  { id: 'peito-02', nome: 'Supino Inclinado com Halteres', grupo_muscular: 'Peito', equipamento: 'Halter', instrucoes: 'Foco na parte superior do peito, descida controlada.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-03', nome: 'Crucifixo Reto com Halteres', grupo_muscular: 'Peito', equipamento: 'Halter', instrucoes: 'Mantenha cotovelos levemente flexionados, alongue o peitoral.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-04', nome: 'Peck Deck (Voador)', grupo_muscular: 'Peito', equipamento: 'Máquina', instrucoes: 'Contraia o peitoral no centro, evite bater os pesos.', video_url: '', categoria: 'Básico' },
  { id: 'peito-05', nome: 'Cross Over Polia Alta', grupo_muscular: 'Peito', equipamento: 'Polia', instrucoes: 'Puxe de cima para baixo focando na parte inferior do peito.', video_url: '', categoria: 'Avançado' },
  { id: 'peito-06', nome: 'Supino Declinado com Barra', grupo_muscular: 'Peito', equipamento: 'Barra', instrucoes: 'Foco na porção inferior, mantenha os pés travados.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-07', nome: 'Flexão de Braços (Push-up)', grupo_muscular: 'Peito', equipamento: 'Peso do Corpo', instrucoes: 'Mantenha o core firme e desça até o chão.', video_url: '', categoria: 'Básico' },
  { id: 'peito-08', nome: 'Dips (Paralelas) para Peito', grupo_muscular: 'Peito', equipamento: 'Paralelas', instrucoes: 'Incline o corpo para frente para recrutar mais o peito.', video_url: '', categoria: 'Avançado' },
  { id: 'peito-09', nome: 'Supino Máquina Convergente', grupo_muscular: 'Peito', equipamento: 'Máquina', instrucoes: 'Movimento guiado ideal para falha muscular segura.', video_url: '', categoria: 'Básico' },
  { id: 'peito-10', nome: 'Crucifixo Inclinado com Halteres', grupo_muscular: 'Peito', equipamento: 'Halter', instrucoes: 'Foco em fibras superiores e alongamento lateral.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-11', nome: 'Supino Reto com Halteres', grupo_muscular: 'Peito', equipamento: 'Halter', instrucoes: 'Maior amplitude de movimento que a barra.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-12', nome: 'Cross Over Polia Média', grupo_muscular: 'Peito', equipamento: 'Polia', instrucoes: 'Puxe horizontalmente cruzando as mãos no centro.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-13', nome: 'Flexão de Braços Inclinada', grupo_muscular: 'Peito', equipamento: 'Banco', instrucoes: 'Pés no banco para foco em fibras superiores.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-14', nome: 'Supino Inclinado com Barra', grupo_muscular: 'Peito', equipamento: 'Barra', instrucoes: 'Controle a descida até a parte alta do peito.', video_url: '', categoria: 'Intermediário' },
  { id: 'peito-15', nome: 'Pullover com Halter', grupo_muscular: 'Peito', equipamento: 'Halter', instrucoes: 'Expanda a caixa torácica na descida lenta.', video_url: '', categoria: 'Avançado' },

  // COSTAS (16-30)
  { id: 'costas-01', nome: 'Puxada Frontal Aberta', grupo_muscular: 'Costas', equipamento: 'Polia', instrucoes: 'Puxe a barra até a clavícula, retraindo escápulas.', video_url: '', categoria: 'Básico' },
  { id: 'costas-02', nome: 'Remada Curvada com Barra', grupo_muscular: 'Costas', equipamento: 'Barra', instrucoes: 'Tronco inclinado, puxe a barra em direção ao umbigo.', video_url: '', categoria: 'Intermediário' },
  { id: 'costas-03', nome: 'Remada Unilateral (Serrote)', grupo_muscular: 'Costas', equipamento: 'Halter', instrucoes: 'Mantenha as costas retas e puxe o halter até o quadril.', video_url: '', categoria: 'Básico' },
  { id: 'costas-04', nome: 'Puxada com Triângulo', grupo_muscular: 'Costas', equipamento: 'Polia', instrucoes: 'Puxe focando no fechamento das escápulas.', video_url: '', categoria: 'Básico' },
  { id: 'costas-05', nome: 'Levantamento Terra (Deadlift)', grupo_muscular: 'Costas', equipamento: 'Barra', instrucoes: 'Exercício composto. Mantenha a coluna neutra e core rígido.', video_url: '', categoria: 'Avançado' },
  { id: 'costas-06', nome: 'Remada Baixa com Triângulo', grupo_muscular: 'Costas', equipamento: 'Polia', instrucoes: 'Estenda bem as costas e puxe espremendo o lats.', video_url: '', categoria: 'Básico' },
  { id: 'costas-07', nome: 'Barra Fixa (Pull-up)', grupo_muscular: 'Costas', equipamento: 'Barra Fixa', instrucoes: 'Força total. Puxe o queixo acima da barra.', video_url: '', categoria: 'Avançado' },
  { id: 'costas-08', nome: 'Remada Cavalinho', grupo_muscular: 'Costas', equipamento: 'Máquina/Barra', instrucoes: 'Puxe a carga em direção ao abdome inferior.', video_url: '', categoria: 'Intermediário' },
  { id: 'costas-09', nome: 'Pulldown com Braços Estendidos', grupo_muscular: 'Costas', equipamento: 'Polia', instrucoes: 'Foco total no latíssimo do dorso. Braços fixos.', video_url: '', categoria: 'Intermediário' },
  { id: 'costas-10', nome: 'Remada na Máquina Articulada', grupo_muscular: 'Costas', equipamento: 'Máquina', instrucoes: 'Ajuste o banco para puxar na linha do peito baixo.', video_url: '', categoria: 'Básico' },
  { id: 'costas-11', nome: 'Puxada Supinada (Fechada)', grupo_muscular: 'Costas', equipamento: 'Polia', instrucoes: 'Palmas para você. Ajuda no recrutamento do bíceps.', video_url: '', categoria: 'Básico' },
  { id: 'costas-12', nome: 'Remada com Halteres no Banco Inclinado', grupo_muscular: 'Costas', equipamento: 'Halter', instrucoes: 'Deitado no banco, puxe isolando a dorsal.', video_url: '', categoria: 'Intermediário' },
  // Fixed: Corrected typo 'motme' to 'nome'
  { id: 'costas-13', nome: 'Face Pull', grupo_muscular: 'Costas', equipamento: 'Polia', instrucoes: 'Puxe a corda em direção ao rosto, abrindo os cotovelos.', video_url: '', categoria: 'Intermediário' },
  { id: 'costas-14', nome: 'Crucifixo Inverso no Peck Deck', grupo_muscular: 'Costas', equipamento: 'Máquina', instrucoes: 'Foco em deltoide posterior e romboides.', video_url: '', categoria: 'Básico' },
  { id: 'costas-15', nome: 'Remada Alta com Barra', grupo_muscular: 'Costas', equipamento: 'Barra', instrucoes: 'Puxe a barra até the peito, cotovelos acima das mãos.', video_url: '', categoria: 'Intermediário' },

  // PERNAS - QUADRÍCEPS (31-45)
  { id: 'quads-01', nome: 'Agachamento Livre com Barra', grupo_muscular: 'Pernas', equipamento: 'Barra', instrucoes: 'Pés largura dos ombros, desça quebrando a paralela.', video_url: '', categoria: 'Avançado' },
  { id: 'quads-02', nome: 'Leg Press 45 Graus', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Não bloqueie os joelhos na extensão máxima.', video_url: '', categoria: 'Básico' },
  { id: 'quads-03', nome: 'Cadeira Extensora', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Pico de contração no topo, descida lenta.', video_url: '', categoria: 'Básico' },
  { id: 'quads-04', nome: 'Agachamento Hack', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Mantenha as costas coladas no encosto.', video_url: '', categoria: 'Intermediário' },
  { id: 'quads-05', nome: 'Afundo com Halteres', grupo_muscular: 'Pernas', equipamento: 'Halter', instrucoes: 'Dê um passo à frente e desça o joelho de trás.', video_url: '', categoria: 'Intermediário' },
  { id: 'quads-06', nome: 'Avanço (Caminhada)', grupo_muscular: 'Pernas', equipamento: 'Halter', instrucoes: 'Passadas largas mantendo o equilíbrio e tronco ereto.', video_url: '', categoria: 'Avançado' },
  { id: 'quads-07', nome: 'Agachamento Búlgaro', grupo_muscular: 'Pernas', equipamento: 'Halter/Banco', instrucoes: 'Um pé no banco atrás, desça o quadril verticalmente.', video_url: '', categoria: 'Avançado' },
  { id: 'quads-08', nome: 'Agachamento Frontal com Barra', grupo_muscular: 'Pernas', equipamento: 'Barra', instrucoes: 'Barra sobre os ombros frontais, foco no quadríceps.', video_url: '', categoria: 'Avançado' },
  { id: 'quads-09', nome: 'Agachamento Sumô com Halter', grupo_muscular: 'Pernas', equipamento: 'Halter', instrucoes: 'Pés afastados, pontas para fora. Foco em adutores.', video_url: '', categoria: 'Intermediário' },
  { id: 'quads-10', nome: 'Sissy Squat', grupo_muscular: 'Pernas', equipamento: 'Peso do Corpo', instrucoes: 'Incline o tronco para trás mantendo joelhos fixos.', video_url: '', categoria: 'Avançado' },
  { id: 'quads-11', nome: 'Agachamento no Smith (Multipower)', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Movimento guiado para controle total da carga.', video_url: '', categoria: 'Básico' },
  { id: 'quads-12', nome: 'Passada Lateral com Elástico', grupo_muscular: 'Pernas', equipamento: 'Elástico', instrucoes: 'Foco em glúteo médio e estabilizadores.', video_url: '', categoria: 'Básico' },
  { id: 'quads-13', nome: 'Agachamento Goblet', grupo_muscular: 'Pernas', equipamento: 'Halter/Kettlebell', instrucoes: 'Segure o peso no peito e agache profundamente.', video_url: '', categoria: 'Básico' },
  { id: 'quads-14', nome: 'Leg Press Horizontal', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Ideal para isolamento com segurança lombar.', video_url: '', categoria: 'Básico' },
  { id: 'quads-15', nome: 'Salto em Caixa (Box Jump)', grupo_muscular: 'Pernas', equipamento: 'Caixa', instrucoes: 'Pliometria para explosão muscular.', video_url: '', categoria: 'Avançado' },

  // PERNAS - ISQUIOS/GLÚTEO (46-60)
  { id: 'isquios-01', nome: 'Stiff com Barra', grupo_muscular: 'Pernas', equipamento: 'Barra', instrucoes: 'Joelhos semi-flexionados, desça a barra rente às pernas.', video_url: '', categoria: 'Avançado' },
  { id: 'isquios-02', nome: 'Mesa Flexora', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Mantenha o quadril colado no banco.', video_url: '', categoria: 'Básico' },
  { id: 'isquios-03', nome: 'Cadeira Flexora', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Ajuste o encosto para joelhos alinhados ao eixo.', video_url: '', categoria: 'Básico' },
  { id: 'isquios-04', nome: 'Flexão Nórdica', grupo_muscular: 'Pernas', equipamento: 'Peso do Corpo', instrucoes: 'Controle a descida do tronco apenas com os isquios.', video_url: '', categoria: 'Avançado' },
  { id: 'isquios-05', nome: 'Elevação Pélvica (Hip Thrust)', grupo_muscular: 'Pernas', equipamento: 'Barra/Máquina', instrucoes: 'Melhor exercício para glúteos. Aperte no topo.', video_url: '', categoria: 'Intermediário' },
  { id: 'isquios-06', nome: 'Cadeira Abdutora', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Afaste as pernas focando no glúteo médio.', video_url: '', categoria: 'Básico' },
  { id: 'isquios-07', nome: 'Cadeira Adutora', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Feche as pernas para trabalhar a parte interna.', video_url: '', categoria: 'Básico' },
  { id: 'isquios-08', nome: 'Glúteo Quatro Apoios (Cabo)', grupo_muscular: 'Pernas', equipamento: 'Polia', instrucoes: 'Chute para trás controlando o retorno.', video_url: '', categoria: 'Intermediário' },
  { id: 'isquios-09', nome: 'Good Morning (Bom Dia)', grupo_muscular: 'Pernas', equipamento: 'Barra', instrucoes: 'Barra nos ombros, incline o tronco para frente.', video_url: '', categoria: 'Avançado' },
  { id: 'isquios-10', nome: 'Stiff com Halteres', grupo_muscular: 'Pernas', equipamento: 'Halter', instrucoes: 'Maior liberdade de movimento para os braços.', video_url: '', categoria: 'Intermediário' },
  { id: 'isquios-11', nome: 'Flexora em Pé Unilateral', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Isolamento focado em cada perna separadamente.', video_url: '', categoria: 'Intermediário' },
  { id: 'isquios-12', nome: 'Peso Morto Romeno', grupo_muscular: 'Pernas', equipamento: 'Barra', instrucoes: 'Variação do terra focada em alongamento de isquios.', video_url: '', categoria: 'Avançado' },
  { id: 'isquios-13', nome: 'Extensão de Quadril no Banco Romano', grupo_muscular: 'Pernas', equipamento: 'Banco', instrucoes: 'Foco em lombar e glúteos.', video_url: '', categoria: 'Básico' },
  { id: 'isquios-14', nome: 'Agachamento Lateral (Cossack Squat)', grupo_muscular: 'Pernas', equipamento: 'Peso do Corpo', instrucoes: 'Mobilidade e força lateral.', video_url: '', categoria: 'Avançado' },
  { id: 'isquios-15', nome: 'Pantu. Sentado (Gêmeos)', grupo_muscular: 'Pernas', equipamento: 'Máquina', instrucoes: 'Foco no sóleo. Movimento lento e completo.', video_url: '', categoria: 'Básico' },

  // OMBROS (61-75)
  { id: 'ombro-01', nome: 'Desenvolvimento com Halteres', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'Empurre os halteres acima da cabeça sem bater.', video_url: '', categoria: 'Básico' },
  { id: 'ombro-02', nome: 'Elevação Lateral com Halteres', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'Puxada lateral até a linha dos ombros.', video_url: '', categoria: 'Básico' },
  { id: 'ombro-03', nome: 'Desenvolvimento Militar (Barra)', grupo_muscular: 'Ombros', equipamento: 'Barra', instrucoes: 'Em pé, core firme, empurre a barra verticalmente.', video_url: '', categoria: 'Avançado' },
  { id: 'ombro-04', nome: 'Elevação Frontal com Halteres', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'Levante o peso à frente até a altura dos olhos.', video_url: '', categoria: 'Básico' },
  { id: 'ombro-05', nome: 'Elevação Lateral na Polia', grupo_muscular: 'Ombros', equipamento: 'Polia', instrucoes: 'Tensão constante durante todo o movimento.', video_url: '', categoria: 'Intermediário' },
  { id: 'ombro-06', nome: 'Crucifixo Inverso com Halteres', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'Tronco inclinado, abra os braços lateralmente.', video_url: '', categoria: 'Intermediário' },
  { id: 'ombro-07', nome: 'Desenvolvimento Arnold', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'Inicie com palmas para você e gire ao subir.', video_url: '', categoria: 'Avançado' },
  { id: 'ombro-08', nome: 'Remada Alta (Pegada Aberta)', grupo_muscular: 'Ombros', equipamento: 'Barra', instrucoes: 'Puxe focando nos deltoides laterais.', video_url: '', categoria: 'Intermediário' },
  { id: 'ombro-09', nome: 'Encolhimento com Halteres', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'Foco em trapézio superior. Eleve os ombros.', video_url: '', categoria: 'Básico' },
  { id: 'ombro-10', nome: 'Elevação Frontal com Anilhas', grupo_muscular: 'Ombros', equipamento: 'Anilha', instrucoes: 'Segure a anilha lateralmente e eleve à frente.', video_url: '', categoria: 'Básico' },
  { id: 'ombro-11', nome: 'Desenvolvimento na Máquina', grupo_muscular: 'Ombros', equipamento: 'Máquina', instrucoes: 'Segurança para ombros com carga elevada.', video_url: '', categoria: 'Básico' },
  { id: 'ombro-12', nome: 'Elevação Lateral Inclinada (Banco)', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'De lado no banco inclinado, maior isolamento.', video_url: '', categoria: 'Avançado' },
  { id: 'ombro-13', nome: 'Face Pull com Corda', grupo_muscular: 'Ombros', equipamento: 'Polia', instrucoes: 'Puxe the corda em direção à testa abrindo os braços.', video_url: '', categoria: 'Intermediário' },
  { id: 'ombro-14', nome: 'Prancha com Toque no Ombro', grupo_muscular: 'Ombros', equipamento: 'Peso do Corpo', instrucoes: 'Estabilidade e resistência de ombro.', video_url: '', categoria: 'Intermediário' },
  { id: 'ombro-15', nome: 'Elevação em Y (Halteres)', grupo_muscular: 'Ombros', equipamento: 'Halter', instrucoes: 'Incline o corpo e eleve os braços em formato de Y.', video_url: '', categoria: 'Avançado' },

  // BRAÇOS - BÍCEPS/TRÍCEPS (76-90)
  { id: 'braço-01', nome: 'Rosca Direta com Barra W', grupo_muscular: 'Braços', equipamento: 'Barra W', instrucoes: 'Pegada confortável, evite balançar o tronco.', video_url: '', categoria: 'Básico' },
  { id: 'braço-02', nome: 'Rosca Alternada com Halteres', grupo_muscular: 'Braços', equipamento: 'Halter', instrucoes: 'Gire o punho no topo (supinação) para pico bíceps.', video_url: '', categoria: 'Básico' },
  { id: 'braço-03', nome: 'Rosca Martelo', grupo_muscular: 'Braços', equipamento: 'Halter', instrucoes: 'Pegada neutra. Foco em braquiorradial.', video_url: '', categoria: 'Básico' },
  { id: 'braço-04', nome: 'Rosca Scott', grupo_muscular: 'Braços', equipamento: 'Banco/Barra', instrucoes: 'Isolamento total do bíceps no banco inclinado.', video_url: '', categoria: 'Intermediário' },
  { id: 'braço-05', nome: 'Rosca Concentrada', grupo_muscular: 'Braços', equipamento: 'Halter', instrucoes: 'Sentado, cotovelo apoiado na perna.', video_url: '', categoria: 'Intermediário' },
  { id: 'braço-06', nome: 'Tríceps Polia Alta (Barra)', grupo_muscular: 'Braços', equipamento: 'Polia', instrucoes: 'Cotovelos colados no corpo, estenda totalmente.', video_url: '', categoria: 'Básico' },
  { id: 'braço-07', nome: 'Tríceps Corda', grupo_muscular: 'Braços', equipamento: 'Polia', instrucoes: 'Abra a corda no final da extensão.', video_url: '', categoria: 'Básico' },
  { id: 'braço-08', nome: 'Tríceps Testa com Barra W', grupo_muscular: 'Braços', equipamento: 'Barra W', instrucoes: 'Desça a barra em direção à testa de forma lenta.', video_url: '', categoria: 'Intermediário' },
  { id: 'braço-09', nome: 'Tríceps Francês Unilateral', grupo_muscular: 'Braços', equipamento: 'Halter', instrucoes: 'Peso atrás da cabeça, braço na vertical.', video_url: '', categoria: 'Intermediário' },
  { id: 'braço-10', nome: 'Mergulho no Banco (Dips)', grupo_muscular: 'Braços', equipamento: 'Banco', instrucoes: 'Mantenha as costas rente ao banco.', video_url: '', categoria: 'Básico' },
  { id: 'braço-11', nome: 'Rosca Direta na Polia Baixa', grupo_muscular: 'Braços', equipamento: 'Polia', instrucoes: 'Tensão contínua do cabo.', video_url: '', categoria: 'Básico' },
  { id: 'braço-12', nome: 'Tríceps Coice com Halter', grupo_muscular: 'Braços', equipamento: 'Halter', instrucoes: 'Tronco inclinado, estenda o braço para trás.', video_url: '', categoria: 'Intermediário' },
  { id: 'braço-13', nome: 'Rosca Inversa com Barra', grupo_muscular: 'Braços', equipamento: 'Barra', instrucoes: 'Pegada pronada para foco em antebraço.', video_url: '', categoria: 'Intermediário' },
  { id: 'braço-14', nome: 'Supino Fechado (Tríceps)', grupo_muscular: 'Braços', equipamento: 'Barra', instrucoes: 'Mãos largura dos ombros, foco no tríceps.', video_url: '', categoria: 'Avançado' },
  { id: 'braço-15', nome: 'Rosca 21', grupo_muscular: 'Braços', equipamento: 'Barra', instrucoes: '7 reps baixas, 7 altas, 7 completas.', video_url: '', categoria: 'Avançado' },

  // CORE (91-100)
  { id: 'core-01', nome: 'Abdominal Supra (Crunch)', grupo_muscular: 'Core', equipamento: 'Peso do Corpo', instrucoes: 'Tire as escápulas do chão espremendo o abdome.', video_url: '', categoria: 'Básico' },
  { id: 'core-02', nome: 'Abdominal Infra (Elevação Pernas)', grupo_muscular: 'Core', equipamento: 'Peso do Corpo', instrucoes: 'Eleve as pernas estendidas até 90 graus.', video_url: '', categoria: 'Intermediário' },
  { id: 'core-03', nome: 'Prancha Abdominal (Plank)', grupo_muscular: 'Core', equipamento: 'Peso do Corpo', instrucoes: 'Corpo reto, core e glúteos contraídos.', video_url: '', categoria: 'Básico' },
  { id: 'core-04', nome: 'Bicicleta Abdominal', grupo_muscular: 'Core', equipamento: 'Peso do Corpo', instrucoes: 'Toque cotovelo no joelho oposto com rotação.', video_url: '', categoria: 'Básico' },
  { id: 'core-05', nome: 'Roda Abdominal', grupo_muscular: 'Core', equipamento: 'Roda', instrucoes: 'Desça o máximo que conseguir sem perder a lombar.', video_url: '', categoria: 'Avançado' },
  { id: 'core-06', nome: 'Russian Twist (Rotação)', grupo_muscular: 'Core', equipamento: 'Halter/Anilha', instrucoes: 'Gire o tronco de um lado para o outro.', video_url: '', categoria: 'Intermediário' },
  { id: 'core-07', nome: 'Abdominal na Polia Alta', grupo_muscular: 'Core', equipamento: 'Polia', instrucoes: 'Ajoelhado, puxe a carga com o abdome.', video_url: '', categoria: 'Intermediário' },
  { id: 'core-08', nome: 'Prancha Lateral', grupo_muscular: 'Core', equipamento: 'Peso do Corpo', instrucoes: 'Foco nos oblíquos e estabilidade lateral.', video_url: '', categoria: 'Básico' },
  { id: 'core-09', nome: 'V-Up (Canivete)', grupo_muscular: 'Core', equipamento: 'Peso do Corpo', instrucoes: 'Eleve pernas e tronco simultaneamente.', video_url: '', categoria: 'Avançado' },
  { id: 'core-10', nome: 'Mountain Climbers', grupo_muscular: 'Core', equipamento: 'Peso do Corpo', instrucoes: 'Em posição de prancha, leve os joelhos ao peito.', video_url: '', categoria: 'Básico' }
];

export const MOCK_PERSONAL: User = {
  id: 'p1',
  name: 'Treinador Jorge Prado',
  email: 'jorge@prado.com',
  role: UserRole.PERSONAL,
};

export const MOCK_STUDENTS: User[] = [
  { id: 's1', name: 'João Silva', email: 'joao@email.com', role: UserRole.STUDENT, personalId: 'p1', startDate: Date.now(), profileImage: 'https://ui-avatars.com/api/?name=Joao+Silva&background=10b981&color=fff' },
  { id: 's2', name: 'Maria Souza', email: 'maria@email.com', role: UserRole.STUDENT, personalId: 'p1', startDate: Date.now(), profileImage: 'https://ui-avatars.com/api/?name=Maria+Souza&background=10b981&color=fff' },
];

export const MOCK_EVOLUTION: EvolutionEntry[] = [
  { id: 'e1', date: Date.now(), biometrics: { weight: 80, bodyFat: 15, waist: 85, arm: 38, chest: 100, thigh: 60 }, photos: {} }
];
