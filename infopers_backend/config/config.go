package config

type Config struct {
	DBHost        string
	DBPort        int
	DBUser        string
	DBPass        string
	DBName        string
	Port          string
	SALT          string
	JWTSecret     string
	KeycloakURL   string
	KeycloakRealm string
}

func LoadConfig() *Config {
	return &Config{
		DBHost:        "localhost",
		DBPort:        5432,
		DBUser:        "postgres",
		DBPass:        "admin",
		DBName:        "postgres",
		Port:          ":8085",
		SALT:          "Polri2026!",
		JWTSecret:     "SDMPolriPresisi2026SuperSecureJWTKeyToken!",
		KeycloakURL:   "http://localhost:8080",
		KeycloakRealm: "ssdm-polri",
	}
}

