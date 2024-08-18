import 'package:custom_roadmap/model/custom_roadmap_model.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class CustomRoadmapServices {
  Database? _database;
  static const _tableName = "customRoadmap";

  Future<Database> get database async {
    if (_database != null) {
      return _database!;
    }
    _database = await _initialize();
    return _database!;
  }

  Future<Database> _initialize() async {
    String path = join(await getDatabasesPath(), "CustomRoadmap.db");

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) {
        return db.execute('''
          CREATE TABLE $_tableName (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roadmapName TEXT,
            complete REAL DEFAULT 0
          )
        ''');
      },
    );
  }

  Future<List<CustomRoadmapModel>> getRoadmaps() async {
    final db = await database;

    final List<Map<String, dynamic>> maps = await db.rawQuery('''
        SELECT * FROM $_tableName
      ''');

    return maps.map((map) {
      return CustomRoadmapModel(
        id: map["id"] as int,
        roadmapName: map["roadmapName"] as String,
        complete: map["complete"] as double,
      );
    }).toList();
  }

  Future<void> addNewRoadmap(String roadmapName) async {
    final db = await database;

    await db.insert(
      _tableName,
      {
        "roadmapName": roadmapName,
      },
      conflictAlgorithm: ConflictAlgorithm.fail,
    );
  }

  Future<void> updateRoadmapName(int id, String name) async {
    final db = await database;

    await db.update(
      _tableName,
      {
        "roadmapName": name,
      },
      where: "id = ?",
      whereArgs: [id],
    );
  }

  Future<void> deleteRoadmap(int id) async {
    final db = await database;

    await db.delete(
      _tableName,
      where: "id = ?",
      whereArgs: [id],
    );
  }
}
