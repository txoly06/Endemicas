<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiseaseCase;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GERAR FICHA DO PACIENTE (PDF)
    |--------------------------------------------------------------------------
    | Gera um PDF detalhado com os dados de um caso específico.
    | Inclui um Código QR para verificação rápida de autenticidade (anti-fraude).
    */
    public function patientCard(DiseaseCase $case)
    {
        // Ensure user can view this case
        // $this->authorize('view', $case); 

        $pdf = Pdf::loadView('reports.patient_card', [
            'case' => $case,
            'qr_data' => "http://localhost:5173/verify/" . $case->patient_code
        ])->setOptions(['isRemoteEnabled' => true, 'isHtml5ParserEnabled' => true]);

        return $pdf->download("ficha_paciente_{$case->patient_code}.pdf");
    }

    /*
    |--------------------------------------------------------------------------
    | RELATÓRIO DE CASOS (PDF)
    |--------------------------------------------------------------------------
    | Gera uma lista de casos em PDF baseada nos filtros aplicados.
    | Útil para impressão de listas mensais ou por província.
    */
    public function casesReport(Request $request)
    {
        $query = DiseaseCase::with(['disease', 'registeredBy']);

        // 1. Aplicar filtros (Status, Doença, Província)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('disease_id')) {
            $query->where('disease_id', $request->disease_id);
        }
        if ($request->has('province')) {
            $query->where('province', $request->province);
        }

        $cases = $query->limit(100)->get(); // Limite de 100 para não sobrecarregar o PDF

        $pdf = Pdf::loadView('reports.cases_report', [
            'cases' => $cases,
            'filters' => $request->all()
        ]);

        return $pdf->download('relatorio_casos.pdf');
    }

    /*
    |--------------------------------------------------------------------------
    | EXPORTAR PARA EXCEL (CSV)
    |--------------------------------------------------------------------------
    | Exporta grandes volumes de dados para processamento externo (Excel/Sheets).
    | Usa "stream" para não estourar a memória do servidor se houver milhares de linhas.
    */
    public function exportCsv(Request $request)
    {
        $query = DiseaseCase::with('disease');
        
        // Apply filters
        if ($request->has('status')) $query->where('status', $request->status);
        
        $cases = $query->get();
        
        $csvFileName = 'casos_export_' . date('Y-m-d') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        // Escreve linha a linha na saída
        $callback = function() use ($cases) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Paciente', 'Doença', 'Status', 'Província', 'Data Diagnóstico']);

            foreach ($cases as $case) {
                fputcsv($file, [
                    $case->patient_code,
                    $case->patient_name,
                    $case->disease?->name,
                    $case->status,
                    $case->province,
                    $case->diagnosis_date
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
