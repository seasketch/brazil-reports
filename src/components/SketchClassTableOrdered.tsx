import React from "react";
import { useTranslation } from "react-i18next";
import { percentWithEdge } from "@seasketch/geoprocessing";
import { MetricGroup } from "@seasketch/geoprocessing";
import { Column, Table } from "@seasketch/geoprocessing/client-ui";

import { styled } from "styled-components";
import { SmallReportTableStyled } from "@seasketch/geoprocessing/client-ui";

/**
 * Style component for SketchClassTable
 */
export const SketchClassTableStyled = styled(SmallReportTableStyled)`
  & {
    width: 100%;
    overflow-x: scroll;
  }

  & th:first-child,
  & td:first-child {
    position: sticky;
    left: 0;
    background: #efefef;
  }

  & th,
  & td {
  }

  .styled {
    font-size: 12px;
`;

export interface SketchClassTableProps {
  /** Table rows, expected to have sketchName property and one property for each classId in classes */
  rows: Record<string, string | number>[];
  /** Data class definitions */
  metricGroup: MetricGroup;
  /** Whether to format values as percentages, defaults to false */
  formatPerc?: boolean;
  /** Order that columns will appear in table */
  columnOrder: string[];
}

/**
 * Table displaying sketch class metrics, one table row per sketch
 * @param param0
 * @returns
 */
export const SketchClassTableOrdered: React.FunctionComponent<
  SketchClassTableProps
> = ({
  rows,
  metricGroup: dataGroup,
  formatPerc: usePerc = false,
  columnOrder,
}) => {
  const { t } = useTranslation();

  const mpaLabel = t("MPA");

  const classColumns: Column<Record<string, string | number>>[] =
    dataGroup.classes.map((curClass) => ({
      Header: curClass.display,
      accessor: (row) => {
        return usePerc
          ? percentWithEdge(row[curClass.classId] as number)
          : row[curClass.classId];
      },
    }));

  const classColumnsOrdered = classColumns.sort((a, b) => {
    return (
      // @ts-ignore
      columnOrder.indexOf(a.Header) - columnOrder.indexOf(b.Header)
    );
  });

  const columns: Column<Record<string, string | number>>[] = [
    {
      Header: mpaLabel,
      accessor: (row) => {
        return <div style={{ width: 120 }}>{row.sketchName}</div>;
      },
    },
    ...classColumnsOrdered,
  ];

  console.log("columns", columns);

  return (
    <SketchClassTableStyled>
      <Table className="styled" columns={columns} data={rows} />
    </SketchClassTableStyled>
  );
};

export default SketchClassTableOrdered;
