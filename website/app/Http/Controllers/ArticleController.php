<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArticleController extends Controller
{
    public function index()
    {
        $articles = Article::where('status', 'published')->latest()->paginate(10);
        return view('admin.documents.index', compact('articles'));
    }

    public function drafts()
    {
        $drafts = Article::where('status', 'draft')->latest()->paginate(10);
        return view('admin.documents.drafts', compact('drafts'));
    }

    public function create()
    {
        $admins = User::all();
        return view('admin.documents.upload', compact('admins'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'admin_name' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|max:5120',
            'status' => 'required|in:published,draft'
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('articles', 'public');
        }

        $article = Article::create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'admin_name' => $validated['admin_name'],
            'content' => $validated['content'],
            'image_path' => $imagePath,
            'status' => $validated['status'],
        ]);

        $action = $validated['status'] === 'published' ? 'publish_article' : 'create_document';
        \App\Services\AdminActivityService::log(
            action: $action,
            category: 'documents',
            description: ($validated['status'] === 'published' ? 'Published' : 'Drafted') . " article: '{$validated['title']}'",
            metadata: ['article_id' => $article->id],
            riskLevel: 'Low'
        );

        $message = $validated['status'] === 'published' ? 'Article published successfully!' : 'Draft saved successfully!';
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'redirect' => $validated['status'] === 'published' ? route('admin.documents.index') : route('admin.documents.drafts')
        ]);
    }

    public function destroy($id)
    {
        $article = Article::findOrFail($id);
        $title = $article->title;
        $articleId = $article->id;

        if ($article->image_path) {
            Storage::disk('public')->delete($article->image_path);
        }
        $article->delete();

        \App\Services\AdminActivityService::log(
            action: 'delete_article',
            category: 'documents',
            description: "Deleted article: '{$title}'",
            metadata: ['article_id' => $articleId],
            riskLevel: 'High'
        );

        return response()->json([
            'success' => true,
            'message' => 'Article deleted successfully!'
        ]);
    }
}
