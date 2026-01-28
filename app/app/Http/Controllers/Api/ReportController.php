<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiseaseCase;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportController extends Controller
{
    /**
     * Download Patient Card as PDF
     */
    public function patientCard(DiseaseCase $case)
    {
        // Ensure user can view this case
        // $this->authorize('view', $case); 

        $pdf = Pdf::loadView('reports.patient_card', [
            'case' => $case,
            'qr_data' => "BILHETE+{$case->patient_dob}+{$case->patient_name}" // Simple generation for now
        ]);

        return $pdf->download("ficha_paciente_{$case->patient_code}.pdf");
    }

    /**
     * Download Cases Report as PDF
     */
    public function casesReport(Request $request)
    {
        $query = DiseaseCase::with(['disease', 'user']);

        // Apply filters (simplified version of CaseService)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('disease_id')) {
            $query->where('disease_id', $request->disease_id);
        }
        if ($request->has('province')) {
            $query->where('province', $request->province);
        }

        $cases = $query->limit(100)->get(); // Limit for PDF performance

        $pdf = Pdf::loadView('reports.cases_report', [
            'cases' => $cases,
            'filters' => $request->all()
        ]);

        return $pdf->download('relatorio_casos.pdf');
    }

    /**
     * Export Cases as CSV
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
