import { FileText, Download, BarChart2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { reportService } from '../../services/reportService';

export default function Reports() {
    const reports = [
        {
            id: 1,
            title: 'Boletim Epidemiológico Semanal',
            description: 'Resumo de casos, alertas e tendências da semana epidemiológica atual.',
            format: 'PDF',
            icon: FileText,
            color: 'bg-blue-50 text-blue-600',
            action: 'Gerar PDF'
        },
        {
            id: 2,
            title: 'Lista Completa de Casos',
            description: 'Exportação detalhada em CSV de todos os casos registados para análise externa.',
            format: 'CSV',
            icon: BarChart2,
            color: 'bg-green-50 text-green-600',
            action: 'Exportar CSV'
        },
        {
            id: 3,
            title: 'Histórico de Alertas',
            description: 'Registo de auditoria de todos os alertas emitidos e o seu estado de resolução.',
            format: 'PDF',
            icon: AlertCircle, // Need to import
            color: 'bg-orange-50 text-orange-600',
            action: 'Gerar PDF'
        }
    ];

    // Fix icon import manually or use generic
    // Using simple approach first

    const handleDownload = async (id: number) => {
        try {
            if (id === 1) {
                // Example: Weekly bulletin could be just the cases list for now
                await reportService.downloadCasesPdf();
            } else if (id === 2) {
                await reportService.downloadCasesCsv();
            } else if (id === 3) {
                alert("Exportação de registo de alertas em breve.");
            }
        } catch (error) {
            console.error("Download failed", error);
            alert("Falha ao descarregar relatório. Por favor tente novamente.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Centro de Relatórios</h1>
                <p className="text-sm text-gray-500">Gerar e descarregar relatórios oficiais de saúde.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 flex flex-col">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${report.color}`}>
                            <report.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                        <p className="text-sm text-gray-500 mb-6 flex-1">{report.description}</p>

                        <div className="pt-4 border-t border-gray-100">
                            <Button
                                variant="outline"
                                className="w-full justify-center group"
                                onClick={() => handleDownload(report.id)}
                            >
                                <Download className="h-4 w-4 mr-2 group-hover:text-blue-600" />
                                {report.action}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 rounded-sm p-6 text-white mt-8">
                <h3 className="text-lg font-bold mb-2">Relatórios Automáticos</h3>
                <p className="text-slate-300 text-sm mb-4">
                    O sistema gera automaticamente o Boletim Semanal todos os Domingos às 00:00.
                    Relatórios anteriores podem ser acedidos no Arquivo.
                </p>
                <Button variant="secondary" size="sm">Ver Arquivo</Button>
            </div>
        </div>
    );
}


