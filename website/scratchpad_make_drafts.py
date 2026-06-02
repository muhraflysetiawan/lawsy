import os

input_file = r'c:\Users\ziyad\lawsy\resources\views\admin\documents\index.blade.php'
output_file = r'c:\Users\ziyad\lawsy\resources\views\admin\documents\drafts.blade.php'

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Make 'View Drafts' the active tab
content = content.replace(
    '<a href="{{ route(\'admin.documents.index\') }}" class="px-6 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md shadow-[#1D5083]/20 transition-all duration-200">View Posts</a>',
    '<a href="{{ route(\'admin.documents.index\') }}" class="px-6 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all duration-200">View Posts</a>'
)

content = content.replace(
    '<a href="{{ route(\'admin.documents.drafts\') }}" class="px-6 py-2.5 bg-white text-[#6B7280] border border-[#E2E8F0] text-sm font-medium rounded-full hover:bg-gray-50 transition-all duration-200">View Drafts</a>',
    '<a href="{{ route(\'admin.documents.drafts\') }}" class="px-6 py-2.5 bg-[#1D5083] text-white text-sm font-medium rounded-full shadow-md shadow-[#1D5083]/20 transition-all duration-200">View Drafts</a>'
)

# Change Status to Draft
content = content.replace("'status' => 'Published'", "'status' => 'Draft'")

# Change buttons
content = content.replace(
    """
                            Edit
                        </button>""",
    """
                            Continue Editing
                        </button>"""
)

content = content.replace(
    """
                            Delete
                        </button>""",
    """
                            Delete Draft
                        </button>"""
)

content = content.replace("of <span class=\"font-medium text-[#1A1A1A]\">50</span> articles", "of <span class=\"font-medium text-[#1A1A1A]\">50</span> drafts")

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Drafts page created.')
