package _go

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	DatabaseDsn string `required:"true"    envconfig:"DATABASE_DSN"`
}

func NewConfig() *Config {
	InitEnv()

	var cfg Config

	if err := envconfig.Process("", &cfg); err != nil {
		fmt.Printf("failed to process env: %v\n", err)
	}

	return &cfg
}

func InitEnv() {
	wd, err := os.Getwd()
	if err != nil {
		fmt.Printf("failed to get current working directory: %v\n", err)
		panic(err)
	}

	// from root
	_ = godotenv.Load(filepath.Join(wd, ".env"))
}
