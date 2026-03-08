# api/views.py
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from .serializers import *
from .logic import *

class RegisterView(APIView):
    """
    POST /api/auth/register/
    body: {username, email, first_name, last_name, password}
    returns: {user:{...}, tokens:{refresh, access}}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {"user": UserSerializer(user).data, "tokens": tokens},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/auth/login/
    body: {username, password}
    returns: {refresh, access, user:{...}}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # LoginSerializer extends TokenObtainPairSerializer and
        # returns tokens + user info in its validate()
        serializer = LoginSerializer(data=request.data)
        print(serializer)
        serializer.is_valid(raise_exception=True)
        # serializer.validated_data contains: {"refresh": "...", "access": "...", "user": {...}}
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class MeView(APIView):
    """GET /api/me/ → returns the authenticated user's data (JWT required)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
    
from datetime import datetime

class ChatHistoryCreateView(APIView):
    # Choose one:
    # permission_classes = [IsAuthenticated]   # force storing the logged-in user
    permission_classes = [AllowAny]            # allow anonymous (user will be null)

    def post(self, request):
        chat_data = request.data.copy()
        chat_data.update({'user': request.user.id, 'timestamp': datetime.now().isoformat()})
        result = addData(chat_data)
        
        if result.get('success'):
            all_data = retriveData()
            return Response(all_data[-1], status=status.HTTP_201_CREATED)
        else:
            return Response({'error': result.get('error', 'Failed to add data')}, status=status.HTTP_400_BAD_REQUEST)
        # serializer = ChatHistorySerializer(data=request.data)
        # print(request.data,request.user)
        # # serializer.is_valid(raise_exception=True)
        # # user = request.user if request.user and request.user.is_authenticated else None
        # # instance = serializer.save(user=user) 
        # # dd=ChatHistorySerializer(instance).data
        # print(dd)
        #   # <- set user here

class CategoryCreateView(APIView):
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user and request.user.is_authenticated else None
        instance = serializer.save(user=user)   # <- set user here
        return Response(CategorySerializer(instance).data, status=status.HTTP_201_CREATED)
    
class UserChatHistoryView(APIView):
    """
    GET /api/chat-history/user/
    Returns all chat history of the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data=[]
        for i in retriveData():
            if int(i.get('user',''))==request.user.id:
                data.append(i)
        return Response(    data, status=status.HTTP_200_OK)
        # user = request.user
        # history = ChatHistory.objects.filter(user=user).order_by('-timestamp')
        # serializer = ChatHistorySerializer(history, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)

class UserCategoryFilterView(APIView):
    """
    GET /api/category/user/<category_name>/
    Returns category data of authenticated user filtered by category name.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, category_name):
        user = request.user
        # Case-insensitive filter
        data = Category.objects.filter(
            user=user,
            category__iexact=category_name
        ).order_by('-timestamp')

        serializer = CategorySerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserCategoryListDistinctView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.filter(
            user=request.user
        ).values_list("category", flat=True).distinct()

        return Response(list(categories), status=status.HTTP_200_OK)
    
class AddCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddCategorySerializers(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(AddCategorySerializers(instance).data, status=status.HTTP_201_CREATED)
    
    def get(self, request):
        user = request.user
        categories = AddCategories.objects.filter(user=user)  # Filter categories by the authenticated user
        serializer = AddCategorySerializers(categories, many=True)  # Serialize all categories
        return Response(serializer.data, status=status.HTTP_200_OK)

class AllCategoriesView(APIView):
    """
    GET /api/categories/
    Returns all categories (no filtering)
    """
    permission_classes = [AllowAny]  # change to IsAuthenticated if needed

    def get(self, request):
        user = request.user
        data = AddCategories.objects.filter(user=user).order_by('-timestamp')
        serializer = get_CategorySerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    """
    GET /api/profile/
    Returns the profile of the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateUserProfileView(APIView):
    """
    PUT /api/profile/update/
    Updates logged-in user's profile
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Profile updated", "user": serializer.data})

# class filter_UserChatHistoryView(APIView):
#     """
#     GET /api/chat-history/user/
#     Returns all chat history of the authenticated user.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         history = chat_History.objects.filter(user=user).order_by('-timestamp')
#         serializer = ChatHistorySerializer(history, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)





    