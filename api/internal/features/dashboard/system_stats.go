package dashboard

import (
	"bytes"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/raghavyuva/nixopus-api/internal/features/logger"
)

const (
	bytesInMB = 1024 * 1024
	bytesInGB = 1024 * 1024 * 1024
)

func (m *DashboardMonitor) GetSystemStats() {
	stats := SystemStats{
		Timestamp: time.Now(),
		Memory:    MemoryStats{},
		Load:      LoadStats{},
		Disk:      DiskStats{AllMounts: []DiskMount{}},
	}

	if osType, err := m.getCommandOutput("uname -s"); err == nil {
		stats.OSType = strings.TrimSpace(osType)
	} else {
		m.BroadcastError(err.Error(), GetSystemStats)
		return
	}

	if cpuInfo, err := m.getCommandOutput("cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d ':' -f2"); err == nil {
		stats.CPUInfo = strings.TrimSpace(cpuInfo)
	}

	if loadAvg, err := m.getCommandOutput("uptime"); err == nil {
		loadAvgStr := strings.TrimSpace(loadAvg)
		stats.Load = parseLoadAverage(loadAvgStr)
	}

	if memInfo, err := m.getCommandOutput("free -b"); err == nil {
		stats.Memory = parseMemoryInfo(memInfo)
	}

	if diskInfo, err := m.getCommandOutput("df -h"); err == nil {
		stats.Disk = parseDiskInfo(diskInfo)
	}

	m.Broadcast(string(GetSystemStats), stats)
}

func parseLoadAverage(loadStr string) LoadStats {
	loadStats := LoadStats{}

	uptimeRe := regexp.MustCompile(`up\s+(.+?),?\s+\d+\s+users?`)
	if matches := uptimeRe.FindStringSubmatch(loadStr); len(matches) >= 2 {
		loadStats.Uptime = strings.TrimSpace(matches[1])
	}

	loadRe := regexp.MustCompile(`load averages?: ([\d.]+),? ([\d.]+),? ([\d.]+)`)
	matches := loadRe.FindStringSubmatch(loadStr)
	if len(matches) >= 4 {
		if one, err := strconv.ParseFloat(matches[1], 64); err == nil {
			loadStats.OneMin = one
		}
		if five, err := strconv.ParseFloat(matches[2], 64); err == nil {
			loadStats.FiveMin = five
		}
		if fifteen, err := strconv.ParseFloat(matches[3], 64); err == nil {
			loadStats.FifteenMin = fifteen
		}
	}

	return loadStats
}

func parseMemoryInfo(memStr string) MemoryStats {
	memory := MemoryStats{}

	lines := strings.Split(memStr, "\n")
	if len(lines) < 2 {
		return memory
	}

	fields := strings.Fields(lines[1])
	if len(fields) >= 3 {
		if total, err := strconv.ParseUint(fields[1], 10, 64); err == nil {
			memory.Total = float64(total) / bytesInGB
		}
		if used, err := strconv.ParseUint(fields[2], 10, 64); err == nil {
			memory.Used = float64(used) / bytesInGB
		}
		if len(fields) >= 4 {
			if free, err := strconv.ParseUint(fields[3], 10, 64); err == nil {
				if memory.Total > 0 {
					memory.Percentage = (memory.Used / memory.Total) * 100
				}
				memory.RawInfo = fmt.Sprintf("Total: %.2f GB, Used: %.2f GB, Free: %.2f GB",
					memory.Total, memory.Used, float64(free)/bytesInGB)
			}
		}
	}

	return memory
}

func parseDiskInfo(diskStr string) DiskStats {
	diskStats := DiskStats{
		AllMounts: []DiskMount{},
	}

	lines := strings.Split(diskStr, "\n")
	if len(lines) < 2 {
		return diskStats
	}

	for i := 1; i < len(lines); i++ {
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}

		fields := strings.Fields(line)
		if len(fields) >= 6 {
			mount := DiskMount{
				Filesystem: fields[0],
				Size:       fields[1],
				Used:       fields[2],
				Avail:      fields[3],
				Capacity:   fields[4],
				MountPoint: fields[5],
			}

			diskStats.AllMounts = append(diskStats.AllMounts, mount)

			if mount.MountPoint == "/" || (diskStats.MountPoint != "/" && diskStats.Total == 0) {
				diskStats.MountPoint = mount.MountPoint

				if size := parseSize(mount.Size); size > 0 {
					diskStats.Total = size
				}
				if used := parseSize(mount.Used); used > 0 {
					diskStats.Used = used
				}
				if avail := parseSize(mount.Avail); avail > 0 {
					diskStats.Available = avail
				}
				if capacity := strings.TrimSuffix(mount.Capacity, "%"); capacity != "" {
					if percentage, err := strconv.ParseFloat(capacity, 64); err == nil {
						diskStats.Percentage = percentage
					}
				}
			}
		}
	}

	return diskStats
}

func parseSize(sizeStr string) float64 {
	if sizeStr == "" {
		return 0
	}

	unit := sizeStr[len(sizeStr)-1:]
	numberStr := sizeStr[:len(sizeStr)-1]

	size, err := strconv.ParseFloat(numberStr, 64)
	if err != nil {
		return 0
	}

	switch strings.ToUpper(unit) {
	case "G":
		return size
	case "M":
		return size / 1024
	case "K":
		return size / (1024 * 1024)
	case "T":
		return size * 1024
	default:
		return size
	}
}

func (m *DashboardMonitor) getCommandOutput(cmd string) (string, error) {
	session, err := m.client.NewSession()
	if err != nil {
		m.log.Log(logger.Error, "Failed to create new session", err.Error())
		return "", err
	}
	defer session.Close()

	var stdoutBuf, stderrBuf bytes.Buffer
	session.Stdout = &stdoutBuf
	session.Stderr = &stderrBuf

	err = session.Run(cmd)
	if err != nil {
		errMsg := fmt.Sprintf("Command failed: %s, stderr: %s", err.Error(), stderrBuf.String())
		m.log.Log(logger.Error, errMsg, "")
		return "", fmt.Errorf(errMsg)
	}

	return stdoutBuf.String(), nil
}
