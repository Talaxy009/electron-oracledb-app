/**
 * 表格面板
 * @param {Object} props 
 */
function TablePanel(props) {
    const { columm, rows } = props

    return (
        <Paper>
            <TableContainer>
                <Table aria-label="tablePanel">
                    <TableHead>
                        <TableRow>
                            {columm.map((value, index) => (
                                <TableCell align="center" key={index}>{value}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                {row.map((value, i) => (
                                    <TableCell align="center" key={i}>{value}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}