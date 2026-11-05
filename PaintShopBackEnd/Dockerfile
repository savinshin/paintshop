FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /app

COPY PaintShopBackEnd.csproj ./
RUN dotnet restore \
    && dotnet tool install --tool-path /usr/local/bin dotnet-ef --version 10.0.14

COPY . .

EXPOSE 8080
CMD ["dotnet", "watch", "--non-interactive", "run", "--no-launch-profile"]
