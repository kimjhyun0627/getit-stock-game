FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 3000
ENV PORT=3000
ENTRYPOINT ["sh", "-c", "java -jar -Dserver.port=${PORT} app.jar"]
