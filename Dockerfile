# ---- Build stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom and wrapper first so dependency layer is cached
COPY pom.xml .
COPY .mvn/ .mvn/
RUN mvn dependency:go-offline -q 2>/dev/null || true

# Copy source + frontend (frontend-maven-plugin downloads its own Node at build time)
COPY src/ src/
COPY frontend/ frontend/

RUN mvn package -DskipTests -q

# ---- Run stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
