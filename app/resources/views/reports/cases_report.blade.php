<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Relatório de Casos</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; color: #333; }
        .header { margin-bottom: 20px; }
        .header h2 { margin: 0; color: #0044cc; }
        .meta { color: #666; font-size: 11px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Relatório de Casos Epidemiológicos</h2>
        <div class="meta">
            Gerado em: {{ date('d/m/Y H:i') }} <br>
            Filtros: {{ json_encode($filters) }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Paciente</th>
                <th>Idade</th>
                <th>Doença</th>
                <th>Status</th>
                <th>Local</th>
                <th>Data Dig.</th>
            </tr>
        </thead>
        <tbody>
            @foreach($cases as $case)
            <tr>
                <td>{{ $case->patient_code }}</td>
                <td>{{ $case->patient_name }}</td>
                <td>{{ \Carbon\Carbon::parse($case->patient_dob)->age }} anos</td>
                <td>{{ $case->disease ? $case->disease->name : '-' }}</td>
                <td>{{ ucfirst($case->status) }}</td>
                <td>{{ $case->municipality }}/{{ $case->province }}</td>
                <td>{{ $case->diagnosis_date }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    @if(count($cases) == 0)
        <p style="text-align: center; color: #999; margin-top: 30px;">Nenhum caso encontrado com os filtros selecionados.</p>
    @endif
</body>
</html>
