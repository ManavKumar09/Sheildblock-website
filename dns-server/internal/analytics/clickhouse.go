package analytics

import (
	"context"
	"log"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type Event struct {
	Timestamp      time.Time
	ConfigHash     string
	Domain         string
	RecordType     string
	IsBlocked      bool
	ResponseTimeMS float32
	BlocklistName  string
}

type DB struct {
	conn       driver.Conn
	events     chan Event
	batchSize  int
	flushTimer time.Duration
}

func NewDB(conn driver.Conn) *DB {
	err := conn.Exec(context.Background(), `
        CREATE TABLE IF NOT EXISTS dns_logs (
            timestamp DateTime,
            config_hash String,
            domain String,
            record_type String,
            is_blocked Bool,
            response_time_ms Float32,
            blocklist_name String
        ) ENGINE = MergeTree()
        ORDER BY (timestamp, config_hash)
    `)
	if err != nil {
		log.Println("clickhouse init error:", err)
	}

	db := &DB{
		conn:       conn,
		events:     make(chan Event, 10000),
		batchSize:  100, // Matching your script
		flushTimer: 5 * time.Second,
	}

	go db.batchWorker()
	return db
}

func (db *DB) Write(event Event) {
	select {
	case db.events <- event:
	default:
		log.Println("analytics buffer full, dropping event")
	}
}

func (db *DB) batchWorker() {
	ticker := time.NewTicker(db.flushTimer)
	defer ticker.Stop()
	var buffer []Event

	flush := func() {
		if len(buffer) == 0 {
			return
		}

		batch, err := db.conn.PrepareBatch(context.Background(), "INSERT INTO dns_logs")
		if err != nil {
			log.Println("clickhouse prepare batch error:", err)
			buffer = buffer[:0]
			return
		}

		for _, e := range buffer {
			err := batch.Append(
				e.Timestamp,
				e.ConfigHash,
				e.Domain,
				e.RecordType,
				e.IsBlocked,
				e.ResponseTimeMS,
				e.BlocklistName,
			)
			if err != nil {
				log.Println("clickhouse batch append error:", err)
			}
		}

		if err := batch.Send(); err != nil {
			log.Println("clickhouse batch send error:", err)
		}
		buffer = buffer[:0]
	}

	for {
		select {
		case e := <-db.events:
			buffer = append(buffer, e)
			if len(buffer) >= db.batchSize {
				flush()
			}
		case <-ticker.C:
			flush()
		}
	}
}