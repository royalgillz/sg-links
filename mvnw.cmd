@REM Maven Wrapper startup batch script
@SETLOCAL EnableDelayedExpansion

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0") ELSE (SET "BASE_DIR=%__MVNW_ARG0_NAME__%")

@SET MAVEN_PROJECTBASEDIR=%BASE_DIR%
@IF NOT "%MAVEN_BASEDIR%"=="" SET "MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%"

@REM Strip trailing backslash
@IF "!MAVEN_PROJECTBASEDIR:~-1!"=="\" SET "MAVEN_PROJECTBASEDIR=!MAVEN_PROJECTBASEDIR:~0,-1!"

@SET "WRAPPER_JAR=!MAVEN_PROJECTBASEDIR!\.mvn\wrapper\maven-wrapper.jar"
@SET "WRAPPER_PROPERTIES=!MAVEN_PROJECTBASEDIR!\.mvn\wrapper\maven-wrapper.properties"

@IF NOT EXIST "!WRAPPER_JAR!" (
    FOR /F "usebackq tokens=1,2 delims==" %%A IN ("!WRAPPER_PROPERTIES!") DO (
        IF "%%A"=="wrapperUrl" SET "WRAPPER_URL=%%B"
    )
    IF NOT "!WRAPPER_URL!"=="" (
        powershell -Command "Invoke-WebRequest -Uri '!WRAPPER_URL!' -OutFile '!WRAPPER_JAR!'"
    )
)

@IF EXIST "%JAVA_HOME%\bin\java.exe" (
    SET "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
) ELSE (
    SET "JAVA_CMD=java"
)

"!JAVA_CMD!" %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% ^
  -classpath "!WRAPPER_JAR!" ^
  "-Dmaven.multiModuleProjectDirectory=!MAVEN_PROJECTBASEDIR!" ^
  org.apache.maven.wrapper.MavenWrapperMain %*

@ENDLOCAL
