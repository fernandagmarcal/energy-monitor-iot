import { HelpCircle, BookOpen, Shield, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Help = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajuda</h1>
        <p className="text-muted-foreground">
          Documentação, glossário e boas práticas
        </p>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Bem-vindo ao Sistema de Monitoramento</AlertTitle>
        <AlertDescription>
          Este sistema permite acompanhar a qualidade de energia em tempo real,
          configurar alarmes e gerar relatórios detalhados para análise.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Guia de Início</CardTitle>
            <CardDescription>
              Aprenda a usar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Como adicionar dispositivos</li>
              <li>• Configurar alarmes</li>
              <li>• Interpretar gráficos</li>
              <li>• Gerar relatórios</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <HelpCircle className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>FAQ</CardTitle>
            <CardDescription>
              Perguntas frequentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• O que é fator de potência?</li>
              <li>• Como interpretar THD?</li>
              <li>• Limites de tensão</li>
              <li>• Configuração de unidades</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Boas práticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Normas de segurança elétrica</li>
              <li>• Procedimentos de emergência</li>
              <li>• Manutenção preventiva</li>
              <li>• Contatos de suporte</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Glossário de Termos Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="potencia">
              <AccordionTrigger>Potência (P, Q, S)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Potência Ativa (P):</strong> Medida em Watts (W) ou kilowatts (kW),
                    representa a energia efetivamente consumida e convertida em trabalho útil.
                  </p>
                  <p>
                    <strong>Potência Reativa (Q):</strong> Medida em var (volt-ampere reativo),
                    é a energia que oscila entre a fonte e a carga, necessária para criar campos
                    magnéticos em motores e transformadores.
                  </p>
                  <p>
                    <strong>Potência Aparente (S):</strong> Medida em VA (volt-ampere),
                    é a combinação vetorial de P e Q: S² = P² + Q².
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fp">
              <AccordionTrigger>Fator de Potência (FP)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    O Fator de Potência é a relação entre a potência ativa e a potência aparente:
                    FP = P / S. Valores ideais estão acima de 0,92.
                  </p>
                  <p>
                    Um FP baixo indica ineficiência energética e pode resultar em multas da
                    concessionária. Pode ser corrigido com banco de capacitores.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="thd">
              <AccordionTrigger>THD (Distorção Harmônica Total)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    THD mede o grau de distorção da forma de onda em relação à senoidal ideal.
                    Expresso em porcentagem, valores altos indicam presença de harmônicos.
                  </p>
                  <p>
                    <strong>Limites recomendados:</strong> THD de tensão {'<'} 5%, THD de corrente {'<'} 8%.
                    Valores elevados podem causar aquecimento, perdas e mau funcionamento de equipamentos.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="frequencia">
              <AccordionTrigger>Frequência</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    A frequência nominal no Brasil é 60 Hz. Variações superiores a ±0,5 Hz podem
                    indicar problemas na rede ou na geração.
                  </p>
                  <p>
                    O monitoramento contínuo da frequência é essencial para identificar
                    instabilidades e garantir o funcionamento adequado de equipamentos sensíveis.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="eventos">
              <AccordionTrigger>Eventos de Qualidade de Energia</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Subtensão (Sag):</strong> Queda temporária de tensão abaixo de 90% do valor nominal.
                  </p>
                  <p>
                    <strong>Sobretensão (Swell):</strong> Elevação temporária acima de 110% do valor nominal.
                  </p>
                  <p>
                    <strong>Interrupção:</strong> Perda completa de tensão por período variável.
                  </p>
                  <p>
                    <strong>Sobrecorrente:</strong> Corrente acima dos limites estabelecidos,
                    podendo indicar sobrecarga ou curto-circuito.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Boas Práticas de Segurança Elétrica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Todas as intervenções em instalações elétricas devem ser realizadas
                por profissionais qualificados e de acordo com a NR-10.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Procedimentos Básicos:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Sempre desligar a energia antes de intervenções</li>
                <li>Utilizar EPIs adequados (luvas, capacetes, óculos)</li>
                <li>Verificar ausência de tensão com equipamentos apropriados</li>
                <li>Sinalizar áreas de trabalho</li>
                <li>Manter registro atualizado de manutenções</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Em caso de emergência:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Acionar imediatamente o responsável pela instalação</li>
                <li>Desligar circuitos afetados se possível fazer com segurança</li>
                <li>Evacuar área em caso de risco iminente</li>
                <li>Contatar bombeiros (193) em caso de incêndio</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
