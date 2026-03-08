from django.urls import path
from .views import *

urlpatterns = [

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path("chat-history/", ChatHistoryCreateView.as_view(), name="chat-history"),
    path("category/", CategoryCreateView.as_view(), name="category-create"),
    path("chat-history/user/", UserChatHistoryView.as_view(), name="user-chat-history"),
    path("category/user/<str:category_name>/", UserCategoryFilterView.as_view(), name="user-category-filter"),
    path("Add-category/", AddCategoryView.as_view(), name="Add-category"),
    # path('refresh/', TokenRefreshView.as_view(), name='token_refresh')
    path("get_categories/", AllCategoriesView.as_view(), name="all_categories"),
    path("profile/", UserProfileView.as_view(), name="user_profile"),
    path("profile/update/", UpdateUserProfileView.as_view(), name="update_profile")

]