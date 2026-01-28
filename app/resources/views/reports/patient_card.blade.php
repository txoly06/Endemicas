<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Ficha do Paciente</title>
    <style>
        body { font-family: sans-serif; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0044cc; padding-bottom: 10px; }
        .header h1 { color: #0044cc; margin: 0; }
        .header p { color: #666; font-size: 12px; margin: 5px 0 0; }
        .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9; }
        .row { margin-bottom: 15px; }
        .label { font-weight: bold; font-size: 12px; color: #666; text-transform: uppercase; }
        .value { font-size: 16px; margin-top: 4px; }
        .status { padding: 5px 10px; border-radius: 4px; font-weight: bold; color: white; display: inline-block; font-size: 12px; }
        .CONFIRMED { background-color: #dc2626; }
        .SUSPECTED { background-color: #ca8a04; }
        .RECOVERED { background-color: #16a34a; }
        .DECEASED { background-color: #4b5563; }
        .qr-section { margin-top: 30px; text-align: center; border-top: 1px dashed #ccc; padding-top: 20px; }
        .qr-box { width: 150px; height: 150px; margin: 0 auto; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; background: white; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ficha do Paciente</h1>
        <p>Sistema de Monitorização de Doenças Endémicas - MINSA</p>
    </div>

    <div class="card">
        <div class="row">
            <div class="label">Código do Paciente</div>
            <div class="value" style="color: #0044cc; font-family: monospace; font-size: 18px;">{{ $case->patient_code }}</div>
        </div>

        <div class="row">
            <div class="label">Nome Completo</div>
            <div class="value">{{ $case->patient_name }}</div>
        </div>

        <table width="100%">
            <tr>
                <td>
                    <div class="label">Data de Nascimento</div>
                    <div class="value">{{ $case->patient_dob }}</div>
                </td>
                <td>
                    <div class="label">Gênero</div>
                    <div class="value">{{ $case->patient_gender === 'M' ? 'Masculino' : ($case->patient_gender === 'F' ? 'Feminino' : 'Outro') }}</div>
                </td>
            </tr>
        </table>
        
        <br>

        <table width="100%">
            <tr>
                <td>
                    <div class="label">Diagnóstico</div>
                    <div class="value">{{ $case->disease ? $case->disease->name : 'Não identificado' }}</div>
                </td>
                <td>
                    <div class="label">Status</div>
                    <div class="value"><span class="status {{ strtoupper($case->status) }}">{{ strtoupper($case->status) }}</span></div>
                </td>
            </tr>
        </table>

         <div class="row" style="margin-top: 15px;">
            <div class="label">Localização</div>
            <div class="value">{{ $case->municipality }}, {{ $case->province }}</div>
        </div>

        <div class="qr-section">
            <div class="qr-box">
                <!-- Using a google chart API for QR code if internet is available, otherwise just text -->
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode($qr_data) }}" alt="QR Code" width="150" height="150">
            </div>
            <div style="margin-top: 5px; font-size: 10px; color: #666;">SCAN OFICIAL</div>
            <div style="font-family: monospace; font-size: 10px;">{{ $qr_data }}</div>
        </div>
    </div>

    <div class="footer">
        Gerado em {{ date('d/m/Y H:i') }} • Documento Oficial
    </div>
</body>
</html>
