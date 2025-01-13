const { Parser } = require("@json2csv/plainjs");

async function downloadCSVHelper(req, res, model, fileName) {
  const { startDate, endDate } = req.query;

  try {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (startDate && endDate) {
      const downloads = await model
        .find({
          createdAt: { $gte: new Date(startDate), $lte: endOfDay },
          extr_id: { $exists: false },
        })
        .lean();

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(downloads);

      res.setHeader("Content-Type", "text/csv");
      res.attachment(`${fileName}.csv`);
      res.send(csv);
    } else if (!startDate || !endDate) {
      const downloads = await model.find().lean();

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(downloads);

      res.setHeader("Content-Type", "text/csv");
      res.attachment(`${fileName}.csv`);
      res.send(csv);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

module.exports = downloadCSVHelper;
