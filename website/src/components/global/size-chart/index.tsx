"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Ruler } from "lucide-react"
import type { ISizeChartRow } from "@/lib/db/models/SizeChart"

interface SizeChartProps {
  name: string
  columns: string[]
  rows: ISizeChartRow[]
  trigger?: React.ReactNode
}

export function SizeChart({ name, columns, rows, trigger }: SizeChartProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="link"
          size="sm"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setIsOpen(true)}
        >
          <Ruler className="h-4 w-4 mr-1" />
          Size Chart
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableHead key={index} className={index === 0 ? "w-[100px]" : ""}>
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-medium">{row.size}</TableCell>
                    {row.measurements.map((measurement, colIndex) => (
                      <TableCell key={colIndex}>{measurement || "-"}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}