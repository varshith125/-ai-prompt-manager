# api/views.py

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from datetime import datetime

from blockchain import contract   # 🔗 blockchain connection

from .serializers import *
from .logic import *


class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": tokens
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )


# 🔗 BLOCKCHAIN INTEGRATION HERE
class ChatHistoryCreateView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        chat_data = request.data.copy()

        chat_data.update({
            'user': request.user.id if request.user.is_authenticated else None,
            'timestamp': datetime.now().isoformat()
        })

        # store in database
        result = addData(chat_data)

        # store in blockchain
        try:

            prompt_text = chat_data.get("prompt", "")

            if prompt_text:

                tx = contract.functions.addPrompt(prompt_text).transact()

                print("Blockchain transaction:", tx)

        except Exception as e:

            print("Blockchain error:", str(e))

        if result.get('success'):

            all_data = retriveData()

            return Response(
                all_data[-1],
                status=status.HTTP_201_CREATED
            )

        else:

            return Response(
                {'error': result.get('error', 'Failed to add data')},
                status=status.HTTP_400_BAD_REQUEST
            )


class CategoryCreateView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = CategorySerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = request.user if request.user.is_authenticated else None

        instance = serializer.save(user=user)

        return Response(
            CategorySerializer(instance).data,
            status=status.HTTP_201_CREATED
        )


class UserChatHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = []

        for i in retriveData():

            if int(i.get('user', '')) == request.user.id:

                data.append(i)

        return Response(data, status=status.HTTP_200_OK)


class UserCategoryFilterView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, category_name):

        user = request.user

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

        serializer = AddCategorySerializers(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        instance = serializer.save()

        return Response(
            AddCategorySerializers(instance).data,
            status=status.HTTP_201_CREATED
        )

    def get(self, request):

        user = request.user

        categories = AddCategories.objects.filter(user=user)

        serializer = AddCategorySerializers(categories, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class AllCategoriesView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        user = request.user

        data = AddCategories.objects.filter(user=user).order_by('-timestamp')

        serializer = get_CategorySerializer(data, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateUserProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        user = request.user

        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response({
            "message": "Profile updated",
            "user": serializer.data
        })