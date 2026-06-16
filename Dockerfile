# ---- Stage 1: Build React frontend ----
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ .
# Build into /static so we can easily copy it out
RUN npx vite build --outDir /static --emptyOutDir

# ---- Stage 2: Build Spring Boot JAR ----
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY .mvn/ .mvn/
RUN mvn dependency:go-offline -q 2>/dev/null || true

COPY src/ src/
# Inject pre-built frontend assets so Spring Boot serves them as static files
COPY --from=frontend /static/ src/main/resources/static/

# skip frontend-maven-plugin, the frontend is already built in stage 1
RUN mvn package -DskipTests -DskipFrontend=true -q

# ---- Stage 3: Run ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Hugging Face Spaces expects the app on port 7860; Spring reads ${PORT}.
# Platforms that inject their own PORT override this at runtime.
ENV PORT=7860
EXPOSE 7860
ENTRYPOINT ["java", "-jar", "app.jar"]
