<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\AlertRepository;
use App\Repositories\CaseRepository;
use App\Repositories\DiseaseRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class StatsController extends Controller
{
    public function __construct(
        private readonly CaseRepository $caseRepository,
        private readonly AlertRepository $alertRepository,
        private readonly DiseaseRepository $diseaseRepository
    ) {}

    /**
     * @OA\Get(
     *      path="/stats/dashboard",
     *      operationId="getDashboardStats",
     *      tags={"Stats"},
     *      summary="Get dashboard stats",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Dashboard statistics",
     *          @OA\JsonContent(
     *              @OA\Property(property="active_cases", type="integer"),
     *              @OA\Property(property="recovered_cases", type="integer"),
     *              @OA\Property(property="deceased_cases", type="integer"),
     *              @OA\Property(property="total_cases", type="integer"),
     *              @OA\Property(property="active_alerts", type="integer"),
     *              @OA\Property(property="diseases_monitored", type="integer")
     *          )
     *      )
     * )
     */
    public function dashboard(): JsonResponse
    {
        $caseStats = $this->caseRepository->getCountsByStatus();
        
        $stats = array_merge($caseStats, [
            'active_alerts' => $this->alertRepository->getActiveCount(),
            'diseases_monitored' => $this->diseaseRepository->getActiveCount(),
        ]);

        return response()->json($stats);
    }

    /**
     * @OA\Get(
     *      path="/stats/diseases",
     *      operationId="getStatsByDisease",
     *      tags={"Stats"},
     *      summary="Get cases by disease",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Cases grouped by disease",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function casesByDisease(): JsonResponse
    {
        return response()->json($this->caseRepository->getCasesByDisease());
    }

    /**
     * @OA\Get(
     *      path="/stats/provinces",
     *      operationId="getStatsByProvince",
     *      tags={"Stats"},
     *      summary="Get cases by province",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Cases grouped by province",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function casesByProvince(): JsonResponse
    {
        return response()->json($this->caseRepository->getCasesByProvince());
    }

    /**
     * @OA\Get(
     *      path="/stats/status",
     *      operationId="getStatsByStatus",
     *      tags={"Stats"},
     *      summary="Get cases by status",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Cases grouped by status",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function casesByStatus(): JsonResponse
    {
        return response()->json($this->caseRepository->getCasesByStatusGrouped());
    }

    /**
     * @OA\Get(
     *      path="/stats/timeline",
     *      operationId="getStatsTimeline",
     *      tags={"Stats"},
     *      summary="Get cases timeline",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="days", in="query", description="Number of days (max 365)", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Daily cases timeline",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function timeline(Request $request): JsonResponse
    {
        $days = min((int) $request->get('days', 30), 365);
        
        return response()->json($this->caseRepository->getTimeline($days));
    }

    /**
     * @OA\Get(
     *      path="/stats/geographic",
     *      operationId="getStatsGeographic",
     *      tags={"Stats"},
     *      summary="Get geographic distribution",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Geographic distribution of cases for heatmap",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function geographic(): JsonResponse
    {
        return response()->json($this->caseRepository->getGeographicData());
    }

    /**
     * @OA\Get(
     *      path="/stats/demographics/age",
     *      operationId="getStatsByAge",
     *      tags={"Stats"},
     *      summary="Get cases by age group",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Cases grouped by age group",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function casesByAgeGroup(): JsonResponse
    {
        return response()->json($this->caseRepository->getCasesByAgeGroup());
    }

    /**
     * @OA\Get(
     *      path="/stats/demographics/gender",
     *      operationId="getStatsByGender",
     *      tags={"Stats"},
     *      summary="Get cases by gender",
     *      security={{"bearerAuth":{}}},
     *      @OA\Response(
     *          response=200,
     *          description="Cases grouped by gender",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function casesByGender(): JsonResponse
    {
        return response()->json($this->caseRepository->getCasesByGender());
    }
}
