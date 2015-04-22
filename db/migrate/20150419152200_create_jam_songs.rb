class CreateJamSongs < ActiveRecord::Migration
  def change
    create_table :jam_songs do |t|
      t.integer :jam_id, null: false
      t.integer :song_id, null: false

      t.timestamps null: false
    end
  end
end
