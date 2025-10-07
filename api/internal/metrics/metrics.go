package routes

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

var startTime = time.Now()

func MetricsHandler(w http.ResponseWriter, r *http.Request) {
	uptime := int(time.Since(startTime).Seconds())

	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	metrics := map[string]interface{}{
		"uptime_seconds": uptime,
		"memory_alloc":   memStats.Alloc,
		"memory_total":   memStats.TotalAlloc,
		"memory_sys":     memStats.Sys,
		"goroutines":     runtime.NumGoroutine(),
		"status":         "healthy",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}
