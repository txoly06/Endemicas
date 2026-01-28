<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EducationalContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EducationalContentController extends Controller
{
    /**
     * @OA\Get(
     *      path="/public/content",
     *      operationId="getPublicContent",
     *      tags={"Content", "Public"},
     *      summary="List public content",
     *      description="Get educational content for the public",
     *      @OA\Parameter(name="type", in="query", description="Filter by type", required=false, @OA\Schema(type="string", enum={"article","faq","guide","video"})),
     *      @OA\Parameter(name="disease_id", in="query", description="Filter by disease ID", required=false, @OA\Schema(type="integer")),
     *      @OA\Parameter(name="search", in="query", description="Search by title or content", required=false, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="List of content",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="current_page", type="integer"),
     *              @OA\Property(property="total", type="integer")
     *          )
     *      )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = EducationalContent::published()->with(['disease:id,name', 'author:id,name']);

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->has('disease_id')) {
            $query->where('disease_id', $request->disease_id);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('content', 'like', "%{$request->search}%");
            });
        }

        $contents = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($contents);
    }

    /**
     * @OA\Get(
     *      path="/admin/content",
     *      operationId="getAdminContent",
     *      tags={"Content"},
     *      summary="List content (Admin)",
     *      description="Manage educational content",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="published", in="query", description="Filter by published status", required=false, @OA\Schema(type="boolean")),
     *      @OA\Response(
     *          response=200,
     *          description="List of content",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="current_page", type="integer"),
     *              @OA\Property(property="total", type="integer")
     *          )
     *      )
     * )
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = EducationalContent::with(['disease:id,name', 'author:id,name']);

        if ($request->has('published')) {
            $query->where('is_published', $request->boolean('published'));
        }

        $contents = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($contents);
    }

    /**
     * @OA\Post(
     *      path="/content",
     *      operationId="createContent",
     *      tags={"Content"},
     *      summary="Create content",
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"title","content","type"},
     *              @OA\Property(property="disease_id", type="integer", example=1),
     *              @OA\Property(property="title", type="string", example="Malaria Prevention"),
     *              @OA\Property(property="slug", type="string", example="malaria-prevention"),
     *              @OA\Property(property="content", type="string", example="Full text content..."),
     *              @OA\Property(property="type", type="string", enum={"article","faq","guide","video"}, example="guide"),
     *              @OA\Property(property="image_url", type="string", format="url"),
     *              @OA\Property(property="is_published", type="boolean", example=true)
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Content created successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Content created successfully"),
     *              @OA\Property(property="content", type="object")
     *          )
     *      ),
     *      @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'disease_id' => ['nullable', 'exists:diseases,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:educational_contents'],
            'content' => ['required', 'string'],
            'type' => ['required', 'in:article,faq,guide,video'],
            'image_url' => ['nullable', 'url'],
            'is_published' => ['boolean'],
        ]);

        $validated['author_id'] = $request->user()->id;

        $content = EducationalContent::create($validated);

        return response()->json([
            'message' => 'Content created successfully',
            'content' => $content,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/public/content/{slug}",
     *      operationId="getContent",
     *      tags={"Content", "Public"},
     *      summary="Get content details",
     *      description="Get content details by slug",
     *      @OA\Parameter(name="slug", in="path", description="Content slug", required=true, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="Content details",
     *          @OA\JsonContent(
     *              @OA\Property(property="id", type="integer"),
     *              @OA\Property(property="title", type="string"),
     *              @OA\Property(property="content", type="string"),
     *              @OA\Property(property="author", type="object")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Content not found")
     * )
     */
    public function show(string $slug): JsonResponse
    {
        $content = EducationalContent::where('slug', $slug)
            ->published()
            ->with(['disease', 'author:id,name'])
            ->firstOrFail();

        return response()->json($content);
    }

    /**
     * @OA\Put(
     *      path="/content/{id}",
     *      operationId="updateContent",
     *      tags={"Content"},
     *      summary="Update content",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Content ID", required=true, @OA\Schema(type="integer")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="title", type="string"),
     *              @OA\Property(property="content", type="string"),
     *              @OA\Property(property="type", type="string", enum={"article","faq","guide","video"}),
     *              @OA\Property(property="is_published", type="boolean")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Content updated successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Content updated successfully"),
     *              @OA\Property(property="content", type="object")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Content not found")
     * )
     */
    public function update(Request $request, EducationalContent $content): JsonResponse
    {
        $validated = $request->validate([
            'disease_id' => ['nullable', 'exists:diseases,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:educational_contents,slug,' . $content->id],
            'content' => ['sometimes', 'string'],
            'type' => ['sometimes', 'in:article,faq,guide,video'],
            'image_url' => ['nullable', 'url'],
            'is_published' => ['boolean'],
        ]);

        $content->update($validated);

        return response()->json([
            'message' => 'Content updated successfully',
            'content' => $content,
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/content/{id}",
     *      operationId="deleteContent",
     *      tags={"Content"},
     *      summary="Delete content",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Content ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Content deleted successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Content deleted successfully")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Content not found")
     * )
     */
    public function destroy(EducationalContent $content): JsonResponse
    {
        $content->delete();

        return response()->json([
            'message' => 'Content deleted successfully',
        ]);
    }
}
