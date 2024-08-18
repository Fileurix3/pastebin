import 'package:custom_roadmap/model/roadmap_element_model.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class RoadmapElementServices {
  Database? _database;
  static const _tableName = "roadmapElements";

  Future<Database> get database async {
    if (_database != null) {
      return _database!;
    }
    _database = await _initialize();
    return _database!;
  }

  Future<Database> _initialize() async {
    String path = join(await getDatabasesPath(), "RoadmapElements.db");

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) {
        return db.execute('''
          CREATE TABLE $_tableName (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roadmapId INTEGER,
            name TEXT,
            description TEXT,
            isCompleted INTEGER DEFAULT 0
          )
        ''');
      },
    );
  }

  Future<List<RoadmapElementModel>> getRoadmapElemets(int roadmapId) async {
    final db = await database;

    final List<Map<String, dynamic>> maps = await db.rawQuery(
      '''
        SELECT * 
        FROM $_tableName
        WHERE roadmapId = ?
      ''',
      [roadmapId],
    );

    return maps.map((map) {
      return RoadmapElementModel(
        id: map["id"] as int,
        roadmapId: map["roadmapId"] as int,
        name: map["name"] as String,
        description: map["description"] as String,
        isCompleted: map["isCompleted"] as int,
      );
    }).toList();
  }

  Future<void> addNewRoadmapElement(int roadmapId, String name, String description) async {
    final db = await database;

    await db.insert(
      _tableName,
      {
        "roadmapId": roadmapId,
        "name": name,
        "description": description,
        "isCompleted": 0,
      },
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
  }

  Future<void> updateIsCompleted(int id, int value) async {
    final db = await database;

    await db.update(
      _tableName,
      {
        "isCompleted": value,
      },
      where: "id = ?",
      whereArgs: [id],
    );
  }

  Future<double> getPercentageCompleted(int roadmapId) async {
    final db = await database;

    final completedResult = await db.rawQuery(
      '''
      SELECT COUNT(*) AS count
      FROM $_tableName
      WHERE roadmapId = ? AND isCompleted = 1
    ''',
      [roadmapId],
    );

    final notCompletedResult = await db.rawQuery(
      '''
      SELECT COUNT(*) AS count
      FROM $_tableName
      WHERE roadmapId = ? AND isCompleted = 0
    ''',
      [roadmapId],
    );

    final completedCount = completedResult.isNotEmpty ? completedResult.first['count'] as int : 0;
    final notCompletedCount =
        notCompletedResult.isNotEmpty ? notCompletedResult.first['count'] as int : 0;

    final totalCount = completedCount + notCompletedCount;
    final percentageCompleted = totalCount > 0 ? (completedCount / totalCount) * 100 : 0.0;

    return double.parse(percentageCompleted.toStringAsFixed(1));
  }
}
